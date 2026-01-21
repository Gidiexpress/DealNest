from rest_framework import views, permissions, status
from rest_framework.response import Response
from .services import get_gateway, PaymentProcessor
from deals.models import Deal
from .models import PaymentTransaction
from django.conf import settings
from django.db import transaction
from decimal import Decimal
from django.contrib.auth import get_user_model
from core.models import PlatformSettings, Notification
import logging

logger = logging.getLogger(__name__)

User = get_user_model()

class VerifyPaymentView(views.APIView):
    permission_classes = [permissions.AllowAny] # Or Authenticated, depending on flow

    def get(self, request):
        reference = request.query_params.get('reference')
        if not reference:
            return Response({'error': 'No reference provided'}, status=400)

        gateway = get_gateway()
        verification_data = gateway.verify_payment(reference)
        
        # Check status in verification_data
        # Format depends on gateway, but our abstraction should standardize.
        # But we returned raw JSON in services.py. We might need to parse.
        
        status_val = False
        if 'status' in verification_data:
             if verification_data['status'] == True or verification_data['status'] == 'success':
                 status_val = True
             if verification_data['status'] == 'expected_response_for_flutterwave': # Adjust logic
                 pass

        # Improve service abstraction to return standard success boolean
        # For MVP, assume if we get data and status is success/true
        
        success = False
        # Paystack: {status: True, data: {status: 'success', ...}}
        # Flutterwave: {status: 'success', ...}
        
        if verification_data.get('status') == True and verification_data.get('data', {}).get('status') == 'success':
             success = True
        elif verification_data.get('status') == 'success':
             success = True
             
        if success:
            # Reference format: 
            # 1. "fund-{deal.id}-{uuid}" for Deal Payments
            # 2. "DEP-{user.id}-{uuid}" for Deposits
            
            try:
                parts = reference.split('-')
                ref_type = parts[0]
                
                if ref_type == 'fund':
                    deal_id = parts[1]
                    deal = Deal.objects.get(id=deal_id)
                    
                    if 'paystack' in str(gateway.BASE_URL):
                        amount_paid = Decimal(str(verification_data.get('data', {}).get('amount', 0))) / 100
                    else:
                        amount_paid = Decimal(str(verification_data.get('amount', 0)))

                    # Verify amount matches deal + fees
                    settings = PlatformSettings.objects.first()
                    breakdown = settings.calculate_fee_breakdown(deal.amount)
                    
                    if abs(float(amount_paid) - breakdown['total_to_pay']) > 1.0:
                        logger.error(f"Amount mismatch for {reference}: Expected {breakdown['total_to_pay']}, got {amount_paid}")
                        return Response({
                            'error': f"Amount mismatch. Expected {breakdown['total_to_pay']}, got {amount_paid}",
                        }, status=400)

                    # logic delegated to processor
                    raw_data = verification_data
                    gateway_name = 'paystack' if 'paystack' in str(gateway.BASE_URL) else 'flutterwave'
                    
                    success_proc = PaymentProcessor.process_successful_payment(reference, amount_paid, gateway_name, raw_data)
                    
                    if success_proc:
                         return Response({'status': 'verified', 'type': 'deal_payment', 'deal_id': deal.id})
                    else:
                         return Response({'status': 'error', 'message': 'Processing failed'}, status=500)
                
                elif ref_type == 'DEP':
                    # Amount logic
                    # Paystack amount is in kobo in verification_data['data']['amount']
                    if 'paystack' in str(gateway.BASE_URL):
                         amount_paid = Decimal(verification_data.get('data', {}).get('amount', 0)) / 100
                    else:
                         amount_paid = Decimal(str(verification_data.get('amount', 0)))

                    raw_data = verification_data
                    gateway_name = 'paystack' if 'paystack' in str(gateway.BASE_URL) else 'flutterwave'
                    
                    success_proc = PaymentProcessor.process_successful_payment(reference, amount_paid, gateway_name, raw_data)
                    
                    if success_proc:
                         user_id = parts[1]
                         user = User.objects.get(id=user_id) # Reload to get new balance
                         return Response({'status': 'verified', 'type': 'deposit', 'balance': user.balance})
                    else:
                         return Response({'status': 'error', 'message': 'Processing failed'}, status=500)
                
                return Response({'status': 'unknown_reference_type'}, status=400)
                
            except Exception as e:
                logger.error(f"Verification error: {e}")
                return Response({'status': 'error', 'message': str(e)}, status=400)
        else:
             logger.warning(f"Verification failed for {reference}: {verification_data}")
             msg = verification_data.get('message', 'Gateway verification failed')
             return Response({
                 'status': 'failed', 
                 'error': f"Payment not confirmed: {msg}",
                 'data': verification_data
             }, status=400)

class PaystackWebhookView(views.APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        import hmac
        import hashlib
        import json
        
        # 1. Look up secret key
        secret_key = settings.PAYSTACK_SECRET_KEY
        if not secret_key and PlatformSettings.objects.exists():
            ps = PlatformSettings.objects.first()
            secret_key = ps.paystack_secret_key
        
        if not secret_key:
            logger.error("Paystack Webhook: No secret key configured")
            return Response(status=400)

        # 2. Verify signature
        signature = request.headers.get('x-paystack-signature')
        if not signature:
            logger.warning("Paystack Webhook: Missing signature")
            return Response(status=400)
            
        digest = hmac.new(secret_key.encode('utf-8'), request.body, hashlib.sha512).hexdigest()
        if digest != signature:
            logger.warning("Paystack Webhook: Signature mismatch")
            return Response(status=400)
            
        # 3. Process event
        event = json.loads(request.body)
        if event.get('event') == 'charge.success':
            data = event.get('data', {})
            reference = data.get('reference')
            amount = Decimal(data.get('amount')) / 100 # Kobo to Naira
            
            # Using generic processor
            PaymentProcessor.process_successful_payment(reference, amount, 'paystack', event)
            
        return Response(status=200)

class FlutterwaveWebhookView(views.APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        # Verify signature
        secret_hash = getattr(settings, 'FLUTTERWAVE_SECRET_HASH', None)
        signature = request.headers.get('verif-hash')
        
        if not secret_hash:
            # If not in settings, check PlatformSettings
            ps = PlatformSettings.objects.first()
            secret_hash = ps.flutterwave_secret_key # Use secret key as fallback hash if needed, or specific hash
            
        if signature != secret_hash:
            logger.warning("Flutterwave Webhook: Signature mismatch")
            return Response(status=400)
            
        data = request.data
        if data.get('event') == 'charge.completed':
            tx_data = data.get('data', {})
            reference = tx_data.get('tx_ref')
            amount = Decimal(str(tx_data.get('amount', 0)))
            
            # Using generic processor
            PaymentProcessor.process_successful_payment(reference, amount, 'flutterwave', data)
            
        return Response(status=200)

class BankListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        gateway = get_gateway()
        if hasattr(gateway, 'list_banks'):
            banks = gateway.list_banks()
            return Response(banks)
        return Response({'error': 'Active gateway does not support bank listing'}, status=400)

class DepositInitializeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        amount = request.data.get('amount')
        if not amount:
            return Response({'error': 'Amount is required'}, status=400)
            
        import uuid
        reference = f"DEP-{request.user.id}-{uuid.uuid4().hex[:8]}"
        gateway = get_gateway()
        
        # Callback URL should point to frontend dashboard
        callback_url = request.data.get('callback_url', f"{settings.FRONTEND_URL}/dashboard?verify_deposit=true")
        
        init_data = gateway.initialize_payment(
            amount=amount,
            email=request.user.email,
            reference=reference,
            callback_url=callback_url,
            metadata={'user_id': request.user.id, 'type': 'deposit'}
        )
        
        return Response(init_data)

class WithdrawalView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        amount = request.data.get('amount')
        bank_code = request.data.get('bank_code')
        account_number = request.data.get('account_number')
        
        if not all([amount, bank_code, account_number]):
            return Response({'error': 'Amount, bank code, and account number are required'}, status=400)
            
        try:
            amount = Decimal(amount)
        except:
            return Response({'error': 'Invalid amount'}, status=400)

        if request.user.balance < amount:
            return Response({'error': 'Insufficient balance'}, status=400)

        # KYC Check
        if request.user.kyc_status not in ['basic', 'full']:
             return Response({'error': 'Identity verification required for withdrawals. Please verify your account.'}, status=403)
            
        gateway = get_gateway()
        if not hasattr(gateway, 'transfer'):
            return Response({'error': 'Active gateway does not support transfers'}, status=400)
            
        # 1. Resolve Account
        resolve_res = gateway.resolve_bank_account(account_number, bank_code)
        if not resolve_res.get('status'):
            return Response({'error': f"Could not verify account: {resolve_res.get('message')}"}, status=400)
            
        account_name = resolve_res.get('data', {}).get('account_name')
        
        # 2. Create Transfer Recipient
        recipient_res = gateway.create_transfer_recipient(account_name, account_number, bank_code)
        if not recipient_res.get('status'):
            return Response({'error': f"Could not create recipient: {recipient_res.get('message')}"}, status=400)
            
        recipient_code = recipient_res.get('data', {}).get('recipient_code')
        
        # 3. Initiate Transfer
        import uuid
        reference = f"WITH-{request.user.id}-{uuid.uuid4().hex[:8]}"
        transfer_res = gateway.transfer(amount, recipient_code, reference)
        
        if transfer_res.get('status'):
            # Deduct balance atomically
            transfer_code = transfer_res.get('data', {}).get('transfer_code')
            requires_otp = transfer_res.get('data', {}).get('status') == 'otp'
            
            logger.info(f"Withdrawal initiated for user {request.user.id}: {amount}. Reference: {reference}, Requires OTP: {requires_otp}")
            
            try:
                with transaction.atomic():
                    user = request.user
                    if user.balance < amount:
                         return Response({'error': 'Insufficient balance'}, status=400)

                    user.balance -= amount
                    user.save()
                    
                    # Record Transaction
                    PaymentTransaction.objects.create(
                        user=user,
                        gateway='paystack',
                        reference=reference,
                        amount_paid=amount,
                        transaction_type='withdrawal',
                        status='pending' if requires_otp else 'success',
                        raw_response=transfer_res
                    )
            except Exception as e:
                logger.error(f"Error recording withdrawal for {request.user.id}: {e}")
                return Response({'error': 'Transaction recorded but error updating balance'}, status=500)
            
            return Response({
                'status': 'success', 
                'message': 'Withdrawal initiated successfully', 
                'new_balance': user.balance,
                'transfer_code': transfer_code,
                'requires_otp': requires_otp
            })
        else:
            logger.error(f"Transfer initiation failed for {request.user.id}: {transfer_res}")
            return Response({'error': f"Transfer failed: {transfer_res.get('message')}"}, status=400)

class FinalizeWithdrawalView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        transfer_code = request.data.get('transfer_code')
        otp = request.data.get('otp')
        
        if not all([transfer_code, otp]):
             return Response({'error': 'Transfer code and OTP are required'}, status=400)
             
        gateway = get_gateway()
        logger.info(f"Finalizing transfer {transfer_code} with OTP for user {request.user.id}")
        res = gateway.finalize_transfer(transfer_code, otp)
        
        if res.get('status'):
            # Update transaction status
            try:
                # We don't have the transfer_code in the DB yet, we have the 'reference'.
                # But transfer_code is in the raw_response of the pending transaction.
                # Actually, Paystack's finalize returns the transfer object.
                tx = PaymentTransaction.objects.filter(raw_response__contains=transfer_code, status='pending').first()
                if tx:
                    tx.status = 'success'
                    tx.save()
                    
                    # Send Email
                    from core.emails import EmailService
                    EmailService.send_payout_email(tx.user, tx.amount_paid, tx.reference)
            except Exception as e:
                logger.error(f"Error updating transaction status for transfer {transfer_code}: {e}")

            return Response({'status': 'success', 'message': 'Transfer finalized successfully'})
        else:
            logger.error(f"Finalization failed for transfer {transfer_code}: {res}")
            return Response({'error': f"Finalization failed: {res.get('message')}"}, status=400)
