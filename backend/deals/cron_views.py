from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from .models import Deal
from .services import DealService
import os
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def cron_release_funds(request):
    # Security check: verify CRON_SECRET header
    auth_header = request.headers.get('Authorization')
    cron_secret = os.environ.get('CRON_SECRET')
    
    # Allow if CRON_SECRET is set and matches, or if in DEBUG mode (optional)
    if not cron_secret:
        return JsonResponse({'error': 'CRON_SECRET not configured'}, status=500)
        
    expected_header = f"Bearer {cron_secret}"
    if auth_header != expected_header:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    try:
        # Logic: Find deals that are 'delivered' and dispute window expired
        now = timezone.now()
        expired_deals = Deal.objects.filter(
            status='delivered',
            dispute_window_expires__lte=now
        )
        
        count = 0
        errors = []
        
        for deal in expired_deals:
            try:
                # Mark as completed
                deal.status = 'completed'
                deal.save()
                
                # Release funds to freelancer
                DealService.release_payout(deal)
                count += 1
            except Exception as e:
                error_msg = f"Error releasing deal {deal.id}: {str(e)}"
                logger.error(error_msg)
                errors.append(error_msg)
                
        return JsonResponse({
            'status': 'success', 
            'released_count': count,
            'errors': errors
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
