from django.contrib import admin
from .models import PaymentTransaction, Payout

@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ('reference', 'deal', 'amount_paid', 'status', 'gateway', 'created_at')
    list_filter = ('status', 'gateway')
    search_fields = ('reference', 'deal__title')
    readonly_fields = ('raw_response', 'created_at')

@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    list_display = ('reference', 'freelancer', 'amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('reference', 'freelancer__username')
    
    actions = ['process_payout_manually']
    
    @admin.action(description='Mark as Paid (Manual)')
    def process_payout_manually(self, request, queryset):
        queryset.update(status='paid')
