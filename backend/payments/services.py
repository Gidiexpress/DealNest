import requests
from django.conf import settings
from django.db import transaction
from django.contrib.auth import get_user_model
from core.models import PlatformSettings, Notification
from core.emails import EmailService
from deals.models import Deal
from .models import PaymentTransaction
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class BaseGateway:
    def __init__(self, public_key, secret_key, is_test_mode=True):
        self.public_key = public_key
        self.secret_key = secret_key
        self.is_test_mode = is_test_mode

    def initialize_payment(self, amount, email, reference, callback_url, metadata=None):
        raise NotImplementedError

    def verify_payment(self, reference):
        raise NotImplementedError

class PaystackGateway(BaseGateway):
    BASE_URL = "https://api.paystack.co"

    def initialize_payment(self, amount, email, reference, callback_url, metadata=None):
        url = f"{self.BASE_URL}/transaction/initialize"
        # Paystack expects amount in kobo (x100)
        amount_kobo = int(float(amount) * 100)
        
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json",
        }
        data = {
            "email": email,
            "amount": amount_kobo,
            "reference": reference,
            "callback_url": callback_url,
            "metadata": metadata or {}
        }
        
        try:
            response = requests.post(url, json=data, headers=headers)
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}

    def verify_payment(self, reference):
        url = f"{self.BASE_URL}/transaction/verify/{reference}"
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
        }
        
        try:
            response = requests.get(url, headers=headers)
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}

    # Withdrawal & Bank Methods
    def list_banks(self):
        url = f"{self.BASE_URL}/bank"
        headers = {"Authorization": f"Bearer {self.secret_key}"}
        try:
            response = requests.get(url, headers=headers)
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}

    def resolve_bank_account(self, account_number, bank_code):
        url = f"{self.BASE_URL}/bank/resolve"
        headers = {"Authorization": f"Bearer {self.secret_key}"}
        params = {"account_number": account_number, "bank_code": bank_code}
        try:
            response = requests.get(url, headers=headers, params=params)
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}

    def create_transfer_recipient(self, name, account_number, bank_code):
        url = f"{self.BASE_URL}/transferrecipient"
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json",
        }
        data = {
            "type": "nuban",
            "name": name,
            "account_number": account_number,
            "bank_code": bank_code,
            "currency": "NGN"
        }
        try:
            response = requests.post(url, json=data, headers=headers)
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}

    def transfer(self, amount, recipient_code, reference):
        url = f"{self.BASE_URL}/transfer"
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json",
        }
        amount_kobo = int(float(amount) * 100)
        data = {
            "source": "balance",
            "amount": amount_kobo,
            "recipient": recipient_code,
            "reference": reference,
            "reason": "DealNest Withdrawal"
        }
        try:
            response = requests.post(url, json=data, headers=headers)
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}

    def finalize_transfer(self, transfer_code, otp):
        url = f"{self.BASE_URL}/transfer/finalize_transfer"
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json",
        }
        data = {
            "transfer_code": transfer_code,
            "otp": otp
        }
        try:
            response = requests.post(url, json=data, headers=headers)
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}

class FlutterwaveGateway(BaseGateway):
    BASE_URL = "https://api.flutterwave.com/v3"

    def initialize_payment(self, amount, email, reference, callback_url, metadata=None):
        url = f"{self.BASE_URL}/payments"
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json",
        }
        data = {
            "tx_ref": reference,
            "amount": str(amount),
            "currency": "NGN",
            "redirect_url": callback_url,
            "payment_options": "card,mobilemoney,ussd",
            "customer": {
                "email": email,
                "name": metadata.get('customer_name', email) if metadata else email
            },
            "customizations": {
                "title": "DealNest Escrow",
                "description": "Payment for Service"
            },
            "meta": metadata or {}
        }
        
        try:
            response = requests.post(url, json=data, headers=headers)
            return response.json()
        except requests.exceptions.RequestException as e:
             return {"status": "error", "message": str(e)}

    def verify_payment(self, reference):
        # Flutterwave verify by transaction ID usually, but we can use tx_ref endpoint if available or list
        # For v3, typical flow is verify by ID. But webhook gives ID.
        # If we only have ref, we might need to query. 
        # However, standart verify endpoint often takes ID. 
        # Let's assume we get ID from callback or webhook.
        # IF reference is passed, we might need to look it up.
        # For simplicity, implementing query by tx_ref
        
        url = f"{self.BASE_URL}/transactions"
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
        }
        params = {"tx_ref": reference}
        
        try:
            response = requests.get(url, headers=headers, params=params)
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": "error", "message": str(e)}

def get_gateway():
    # Helper to get the active gateway instance based on PlatformSettings
    try:
        settings_obj = PlatformSettings.objects.first()
    except:
        settings_obj = None

    # Get keys from env as fallback
    env_paystack_public = getattr(settings, 'PAYSTACK_PUBLIC_KEY', '') or ''
    env_paystack_secret = getattr(settings, 'PAYSTACK_SECRET_KEY', '') or ''
    env_flutter_public = getattr(settings, 'FLUTTERWAVE_PUBLIC_KEY', '') or ''
    env_flutter_secret = getattr(settings, 'FLUTTERWAVE_SECRET_KEY', '') or ''

        if not settings_obj:
        # Fallback to env if DB not ready
        return PaystackGateway(
            public_key=env_paystack_public,
            secret_key=env_paystack_secret
        )
    
    if settings_obj.active_gateway == 'paystack':
        # Use DB keys if they exist and are not empty, otherwise use env
        public_key = settings_obj.paystack_public_key if settings_obj.paystack_public_key else env_paystack_public
        secret_key = settings_obj.paystack_secret_key if settings_obj.paystack_secret_key else env_paystack_secret
        return PaystackGateway(
            public_key=public_key,
            secret_key=secret_key,
            is_test_mode=settings_obj.use_test_mode
        )
    else:
        public_key = settings_obj.flutterwave_public_key if settings_obj.flutterwave_public_key else env_flutter_public
        secret_key = settings_obj.flutterwave_secret_key if settings_obj.flutterwave_secret_key else env_flutter_secret
        return FlutterwaveGateway(
            public_key=public_key,
            secret_key=secret_key,
            is_test_mode=settings_obj.use_test_mode
        )

class PaymentProcessor:
    @staticmethod
    def process_successful_payment(reference, amount, gateway_name, raw_data):
        """
        Centralized logic to handle successful payments (Deposit or Deal Funding)
        """
        try:
            if reference.startswith('DEP-'):
                return PaymentProcessor._process_deposit(reference, amount, gateway_name, raw_data)
            elif reference.startswith('fund-'):
                return PaymentProcessor._process_deal_funding(reference, amount, gateway_name, raw_data)
            else:
                logger.warning(f"Unknown reference type: {reference}")
                return False
        except Exception as e:
            logger.error(f"Error processing payment {reference}: {e}")
            return False

    @staticmethod
    def _process_deposit(reference, amount, gateway_name, raw_data):
        parts = reference.split('-')
        # Format: DEP-{user_id}-{uuid}
        if len(parts) < 2:
            logger.error(f"Invalid deposit reference format: {reference}")
            return False
            
        user_id = parts[1]
        user = User.objects.get(id=user_id)
        
        with transaction.atomic():
            tx = PaymentTransaction.objects.filter(reference=reference).select_for_update().first()
            
            if tx:
                if tx.status != 'success':
                    # Transaction exists but not marked success (e.g. created by webhook or init)
                    tx.status = 'success'
                    tx.raw_response = raw_data
                    tx.save()
                    
                    user.balance += amount
                    user.save()
                    
                    Notification.objects.create(
                        recipient=user,
                        type='deposit_success',
                        content=f"Deposit of N{amount} confirmed via {gateway_name.title()}."
                    )
            else:
                # Transaction doesn't exist, create it
                PaymentTransaction.objects.create(
                    user=user,
                    gateway=gateway_name,
                    reference=reference,
                    amount_paid=amount,
                    transaction_type='deposit',
                    status='success',
                    raw_response=raw_data
                )
                
                user.balance += amount
                user.save()
                
                Notification.objects.create(
                    recipient=user,
                    type='deposit_success',
                    content=f"Deposit of N{amount} confirmed via {gateway_name.title()}."
                )
        return True

    @staticmethod
    def _process_deal_funding(reference, amount, gateway_name, raw_data):
        parts = reference.split('-')
        # Format: fund-{deal_id}-{uuid}
        if len(parts) < 2:
            logger.error(f"Invalid fund reference format: {reference}")
            return False

        deal_id = parts[1]
        try:
            deal = Deal.objects.get(id=deal_id)
        except Deal.DoesNotExist:
            logger.error(f"Deal {deal_id} not found for payment {reference}")
            return False
            
        with transaction.atomic():
            tx, created = PaymentTransaction.objects.get_or_create(
                reference=reference,
                defaults={
                    'user': deal.client,
                    'deal': deal,
                    'gateway': gateway_name,
                    'amount_paid': amount,
                    'transaction_type': 'deal_payment',
                    'status': 'success',
                    'raw_response': raw_data
                }
            )
            
            if not created and tx.status != 'success':
                tx.status = 'success'
                tx.raw_response = raw_data
                tx.save()
            
            if deal.status == 'created':
                deal.status = 'funded'
                deal.save()
                
                if deal.freelancer:
                    Notification.objects.create(
                        recipient=deal.freelancer,
                        type='deal_funded',
                        content=f"Deal '{deal.title}' has been funded via {gateway_name.title()}."
                    )
                    EmailService.send_deal_funded_email(deal)
        return True
