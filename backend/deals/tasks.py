from celery import shared_task
from django.utils import timezone
from .models import Deal

@shared_task
def auto_release_funds():
    from .services import DealService
    # Find deals that are 'delivered' and dispute window expired
    now = timezone.now()
    expired_deals = Deal.objects.filter(
        status='delivered',
        dispute_window_expires__lte=now
    )
    
    count = 0
    for deal in expired_deals:
        # Mark as completed
        deal.status = 'completed'
        deal.save()
        
        # Release funds to freelancer
        DealService.release_payout(deal)
        count += 1
    
    return f"Auto-released {count} deals"
