from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_email(subject, recipient_list, template_name, context):
        """
        Generic method to send HTML emails.
        """
        try:
            html_message = render_to_string(template_name, context)
            plain_message = strip_tags(html_message)
            from_email = settings.DEFAULT_FROM_EMAIL
            
            send_mail(
                subject,
                plain_message,
                from_email,
                recipient_list,
                html_message=html_message,
                fail_silently=False,
            )
            logger.info(f"Email '{subject}' sent to {recipient_list}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email '{subject}' to {recipient_list}: {e}")
            return False

    @classmethod
    def send_welcome_email(cls, user):
        subject = "Welcome to DealNest! 🚀"
        context = {
            'user': user,
            'cta_url': f"{settings.FRONTEND_URL}/dashboard"
        }
        return cls.send_email(subject, [user.email], 'emails/welcome.html', context)

    @classmethod
    def send_deal_funded_email(cls, deal):
        if not deal.freelancer:
            return
            
        subject = f"Deal Funded: {deal.title} 💰"
        context = {
            'user': deal.freelancer,
            'deal': deal,
            'cta_url': f"{settings.FRONTEND_URL}/deals/{deal.id}"
        }
        return cls.send_email(subject, [deal.freelancer.email], 'emails/deal_funded.html', context)

    @classmethod
    def send_deal_delivered_email(cls, deal):
        subject = f"Work Delivered: {deal.title} 📦"
        context = {
            'user': deal.client,
            'deal': deal,
            'cta_url': f"{settings.FRONTEND_URL}/deals/{deal.id}"
        }
        return cls.send_email(subject, [deal.client.email], 'emails/deal_delivered.html', context)

    @classmethod
    def send_payout_email(cls, user, amount, reference):
        subject = f"Payout Processed: ₦{amount} 💸"
        context = {
            'user': user,
            'amount': amount,
            'reference': reference,
            'cta_url': f"{settings.FRONTEND_URL}/dashboard"
        }
        return cls.send_email(subject, [user.email], 'emails/payout_processed.html', context)

    @classmethod
    def send_deal_accepted_email(cls, deal):
        subject = f"Deal Accepted: {deal.title} ✅"
        context = {
            'user': deal.client,
            'freelancer': deal.freelancer,
            'deal': deal,
            'cta_url': f"{settings.FRONTEND_URL}/deals/{deal.id}"
        }
        return cls.send_email(subject, [deal.client.email], 'emails/deal_accepted.html', context)

    @classmethod
    def send_dispute_opened_email(cls, deal, opener, other_party):
        subject = f"Dispute Opened: {deal.title} ⚠️"
        context = {
            'user': other_party,
            'opener': opener,
            'deal': deal,
            'cta_url': f"{settings.FRONTEND_URL}/deals/{deal.id}"
        }
        return cls.send_email(subject, [other_party.email], 'emails/dispute_opened.html', context)

    @classmethod
    def send_funds_released_email(cls, deal, amount):
        subject = f"Funds Released: {deal.title} 💰"
        context = {
            'user': deal.freelancer,
            'amount': amount,
            'deal': deal,
            'cta_url': f"{settings.FRONTEND_URL}/dashboard"
        }
        return cls.send_email(subject, [deal.freelancer.email], 'emails/funds_released.html', context)
