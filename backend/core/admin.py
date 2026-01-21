from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, PlatformSettings, JobType

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'kyc_status', 'total_deals_completed', 'is_staff')
    list_filter = ('role', 'kyc_status', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('DealNest Info', {'fields': ('role', 'phone_number', 'avatar', 'bio', 'kyc_status',)}),
        ('Banking', {'fields': ('bank_name', 'bank_account', 'bank_account_name')}),
    )

@admin.register(PlatformSettings)
class PlatformSettingsAdmin(admin.ModelAdmin):
    # Singleton check logic typically here or in model
    # For MVP, we just let it be.
    list_display = ('active_gateway', 'platform_fee_percent', 'fee_payer')
    fieldsets = (
        ('Gateways', {
            'fields': (
                'active_gateway', 'use_test_mode',
                'paystack_public_key', 'paystack_secret_key',
                'flutterwave_public_key', 'flutterwave_secret_key'
            )
        }),
        ('Fees & Policies', {
            'fields': ('platform_fee_percent', 'fee_payer', 'dispute_window_days', 'auto_release_days')
        }),
        ('Support', {
            'fields': ('support_email', 'whatsapp_link')
        }),
    )

@admin.register(JobType)
class JobTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
