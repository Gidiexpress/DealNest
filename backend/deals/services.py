import uuid
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from django.db.models import Q
from rest_framework.exceptions import ValidationError, PermissionDenied
from .models import Deal, DealMessage, Dispute, DealSubmission
from core.models import Notification, PlatformSettings
from payments.services import get_gateway
from payments.models import PaymentTransaction
from core.emails import EmailService
import logging

logger = logging.getLogger(__name__)

class DealService:
    @staticmethod
    def fund_deal(deal: Deal, user, payment_method='gateway', callback_url=None):
        if deal.status != 'created':
            raise ValidationError('Deal cannot be funded currently')
        
        settings, _ = PlatformSettings.objects.get_or_create()
        breakdown = settings.calculate_fee_breakdown(deal.amount)
        pay_amount = Decimal(str(breakdown['total_to_pay']))

        if payment_method == 'wallet':
            if user.balance < pay_amount:
                raise ValidationError(f'Insufficient wallet balance. You need ₦{pay_amount}, but have ₦{user.balance}')
            
            try:
                with transaction.atomic():
                    user.balance -= pay_amount
                    user.save()
                    
                    deal.status = 'funded'
                    deal.save()
                    
                    PaymentTransaction.objects.create(
                        user=user,
                        deal=deal,
                        amount_paid=pay_amount,
                        transaction_type='deal_payment',
                        gateway='wallet',
                        status='success',
                        reference=f"wallet-{deal.id}-{uuid.uuid4().hex[:10]}"
                    )
                    
                    if deal.freelancer:
                        Notification.objects.create(
                            recipient=deal.freelancer,
                            type='deal_funded',
                            content=f"Deal '{deal.title}' has been funded from the client's wallet. You can start working!"
                        )
                        EmailService.send_deal_funded_email(deal)
                
                return {'status': 'success', 'message': 'Deal funded successfully from your wallet balance.', 'breakdown': breakdown}
            except Exception as e:
                logger.error(f"Wallet funding failed for deal {deal.id}: {e}")
                raise Exception(f"Wallet payment failed: {str(e)}")

        # Gateway Initialization
        gateway = get_gateway()
        if not user.email:
            raise ValidationError('User email required for payment')

        reference = f"fund-{deal.id}-{uuid.uuid4().hex[:10]}"
        try:
            init_data = gateway.initialize_payment(
                amount=pay_amount,
                email=user.email,
                reference=reference,
                callback_url=callback_url,
                metadata={'deal_id': deal.id, 'type': 'fund_deal', 'breakdown': breakdown}
            )
            if init_data.get('status') is not False:
                init_data['breakdown'] = breakdown
                return init_data
            else:
                logger.error(f"Gateway initialization failed for deal {deal.id}: {init_data}")
                return init_data
        except Exception as e:
            logger.error(f"Error initializing payment for deal {deal.id}: {e}")
            raise Exception(str(e))

    @staticmethod
    def accept_deal(deal: Deal, user):
        if deal.freelancer:
            raise ValidationError('Deal already has a freelancer')
        
        # KYC Check
        if user.kyc_status not in ['basic', 'full']:
            raise ValidationError('You must complete identity verification to accept deals.')
        
        if user == deal.client:
            raise ValidationError('You cannot accept your own deal')
        
        deal.freelancer = user
        deal.save()

        Notification.objects.create(
            recipient=deal.client,
            actor=user,
            deal=deal,
            type='deal_accepted',
            content=f"{user.username} has accepted the deal: {deal.title}"
        )
        
        EmailService.send_deal_accepted_email(deal)
        return deal

    @staticmethod
    def start_work(deal: Deal, user):
        if user != deal.freelancer:
            raise PermissionDenied('Only the assigned freelancer can start the work')
        
        if deal.status != 'funded':
             raise ValidationError('Deal must be funded before starting')

        deal.status = 'in_progress'
        deal.save()
        
        Notification.objects.create(
            recipient=deal.client,
            actor=user,
            deal=deal,
            type='message',
            content=f"{user.username} has started working on '{deal.title}'."
        )
        return deal

    @staticmethod
    def deliver_work(deal: Deal, user, data):
        if user != deal.freelancer:
             raise PermissionDenied('Only freelancer can deliver')
        
        if deal.status != 'in_progress':
             raise ValidationError('Deal is not in progress')

        deal.status = 'delivered'
        settings, _ = PlatformSettings.objects.get_or_create()
        days = settings.dispute_window_days
        deal.dispute_window_expires = timezone.now() + timedelta(days=days)
        
        DealSubmission.objects.create(
            deal=deal,
            freelancer=user,
            links=data.get('links', []),
            files=data.get('files', []),
            notes=data.get('notes', ''),
            revision_round=deal.revision_count + 1
        )
        
        deal.revision_count += 1
        deal.save()

        Notification.objects.create(
            recipient=deal.client,
            actor=user,
            deal=deal,
            type='deal_delivered',
            content=f"{user.username} has submitted work (Delivery #{deal.revision_count}). Review needed."
        )

        EmailService.send_deal_delivered_email(deal)

        DealMessage.objects.create(
            deal=deal,
            user=user,
            message=f"📦 **Work Submitted for Review** (Iteration #{deal.revision_count})\n\nNotes: {data.get('notes', 'No notes provided.')}"
        )
        return deal

    @staticmethod
    def approve_deal(deal: Deal, user):
        if user != deal.client:
             raise PermissionDenied('Only client can approve')
        
        if deal.status not in ['delivered', 'disputed']:
             raise ValidationError('Deal must be delivered or disputed to approve')

        deal.status = 'completed'
        deal.save()
        
        return DealService.release_payout(deal, actor=user)

    @staticmethod
    def release_payout(deal: Deal, actor=None):
        freelancer = deal.freelancer
        breakdown = {}
        if freelancer:
            settings, _ = PlatformSettings.objects.get_or_create()
            breakdown = settings.calculate_fee_breakdown(deal.amount)
            net_amount = Decimal(str(breakdown['total_to_receive']))
            
            with transaction.atomic():
                freelancer.refresh_from_db()
                freelancer.balance += net_amount
                freelancer.save()
            
            msg = f"The deal '{deal.title}' has been completed. Funds released (₦{net_amount} after fees)!"
            if actor:
                msg = f"{actor.username} approved the deal '{deal.title}'. Funds released (₦{net_amount} after fees)!"
            
            Notification.objects.create(
                recipient=freelancer,
                deal=deal,
                type='deal_approved',
                content=msg
            )
            
            EmailService.send_funds_released_email(deal, amount=net_amount)
            
            # Optional: Log payout transaction or similar record here
            
        return {'status': 'success', 'message': 'Payout completed', 'breakdown': breakdown}

    @staticmethod
    def dispute_deal(deal: Deal, user, reason):
        if not reason:
             raise ValidationError('Dispute reason is required')

        deal.status = 'disputed'
        deal.save()
        
        Dispute.objects.create(
            deal=deal,
            opened_by=user,
            reason=reason
        )

        other_party = deal.freelancer if user == deal.client else deal.client
        if other_party:
            Notification.objects.create(
                recipient=other_party,
                actor=user,
                deal=deal,
                type='dispute',
                content=f"{user.username} has opened a dispute for the deal: {deal.title}"
            )
            EmailService.send_dispute_opened_email(deal, opener=user, other_party=other_party)
        return {'status': 'disputed'}

    @staticmethod
    def request_revision(deal: Deal, user, feedback):
        if user != deal.client:
             raise PermissionDenied('Only client can request revisions')
        
        if deal.status != 'delivered':
             raise ValidationError('Deal must be in delivered status to request revision')

        deal.status = 'in_progress'
        deal.save()

        Notification.objects.create(
            recipient=deal.freelancer,
            actor=user,
            deal=deal,
            type='message',
            content=f"{user.username} has requested revisions for '{deal.title}'. Review feedback in discussion."
        )
        
        DealMessage.objects.create(
            deal=deal,
            user=user,
            message=f"🛠️ REVISION REQUESTED: {feedback or 'Revision requested.'}"
        )
        return deal

    @staticmethod
    def send_message(deal: Deal, user, message_content, files=None):
        if user != deal.client and user != deal.freelancer:
            raise PermissionDenied('Not authorized')

        if not message_content and not files:
             raise ValidationError('Message cannot be empty')

        msg = DealMessage.objects.create(
            deal=deal,
            user=user,
            message=message_content,
            files=files or []
        )

        other_party = deal.freelancer if user == deal.client else deal.client
        if other_party:
            Notification.objects.create(
                recipient=other_party,
                actor=user,
                deal=deal,
                type='message',
                content=f"New message from {user.username} in '{deal.title}'"
            )
        return msg
