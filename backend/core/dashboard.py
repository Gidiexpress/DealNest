from django.utils.translation import gettext_lazy as _
from deals.models import Deal
from core.models import User
from django.db.models import Count

def dashboard_callback(request, context):
    """
    Callback for django-unfold dashboard to inject custom context.
    """
    total_deals = Deal.objects.count()
    completed_deals = Deal.objects.filter(status='completed').count()
    running_deals = Deal.objects.filter(status__in=['funded', 'in_progress', 'delivered']).count()
    pending_deals = Deal.objects.filter(status='created').count()

    recent_deals = Deal.objects.select_related('client', 'freelancer').order_by('-created_at')[:5]
    recent_users = User.objects.order_by('-date_joined')[:5]

    context.update({
        "total_deals": total_deals,
        "completed_deals": completed_deals,
        "running_deals": running_deals,
        "pending_deals": pending_deals,
        "recent_deals": recent_deals,
        "recent_users": recent_users,
        "total_projects_label": _("Total Deals"),
        "ended_projects_label": _("Completed Deals"),
        "running_projects_label": _("Active Deals"),
        "pending_projects_label": _("New Deals"),
    })
    
    return context
