from django.contrib import admin
from .models import Deal, DealMessage, Dispute

@admin.action(description='Mark selected deals as Completed')
def make_completed(modeladmin, request, queryset):
    queryset.update(status='completed')

@admin.action(description='Cancel selected deals')
def make_cancelled(modeladmin, request, queryset):
    queryset.update(status='cancelled')

@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ('title', 'client', 'freelancer', 'amount', 'status', 'created_at')
    list_filter = ('status', 'job_type')
    search_fields = ('title', 'client__username', 'freelancer__username', 'unique_shareable_url')
    actions = [make_completed, make_cancelled]
    readonly_fields = ('unique_shareable_url',)

@admin.register(Dispute)
class DisputeAdmin(admin.ModelAdmin):
    list_display = ('deal', 'opened_by', 'admin_decision', 'created_at', 'resolved_at')
    list_filter = ('admin_decision',)
    readonly_fields = ('created_at',)
    
    # Custom action to resolve? Or just edit the field.
    # User asked for dedicated list view with "Resolve" actions.
    # Admin change form is sufficient for MVP resolution.
