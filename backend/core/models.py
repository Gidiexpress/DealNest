from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.utils.crypto import get_random_string
import uuid

class User(AbstractUser):
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('freelancer', 'Freelancer'),
        ('both', 'Both'),
    )
    
    KYC_STATUS_CHOICES = (
        ('unverified', 'Unverified'),
        ('pending', 'Pending Verification'),
        ('basic', 'Basic'),
        ('full', 'Full'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='both')
    phone_number = models.CharField(max_length=20, blank=True)
    reference_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
    
    # Banking
    bank_name = models.CharField(max_length=100, blank=True)
    bank_account = models.CharField(max_length=20, blank=True)
    bank_account_name = models.CharField(max_length=100, blank=True)
    
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True)
    
    # KYC
    kyc_document = models.FileField(upload_to='kyc_docs/', blank=True, null=True)
    kyc_status = models.CharField(max_length=20, choices=KYC_STATUS_CHOICES, default='unverified')
    email_verified = models.BooleanField(default=False)
    
    # Financials
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Stats
    rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_deals_completed = models.PositiveIntegerField(default=0)
    disputes_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        if not self.reference_id:
            # Generate DN-USR-XXXXXX format
            unique_code = get_random_string(8, allowed_chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789')
            self.reference_id = f"DN-USR-{unique_code}"
            # Ensure uniqueness
            while User.objects.filter(reference_id=self.reference_id).exists():
                unique_code = get_random_string(8, allowed_chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789')
                self.reference_id = f"DN-USR-{unique_code}"
        super().save(*args, **kwargs)

class PlatformSettings(models.Model):
    GATEWAY_CHOICES = (
        ('paystack', 'Paystack'),
        ('flutterwave', 'Flutterwave'),
    )
    FEE_PAYER_CHOICES = (
        ('client', 'Client'),
        ('freelancer', 'Freelancer'),
        ('split', 'Split (50/50)'),
    )

    active_gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES, default='paystack')
    
    # Secrets (Encrypted or just stored - standard Django models for MVP)
    paystack_public_key = models.CharField(max_length=255, blank=True)
    paystack_secret_key = models.CharField(max_length=255, blank=True)
    
    flutterwave_public_key = models.CharField(max_length=255, blank=True)
    flutterwave_secret_key = models.CharField(max_length=255, blank=True)
    
    use_test_mode = models.BooleanField(default=True)
    
    platform_fee_percent = models.DecimalField(max_digits=5, decimal_places=2, default=5.00)
    min_platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    max_platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    fee_payer = models.CharField(max_length=20, choices=FEE_PAYER_CHOICES, default='split')
    
    dispute_window_days = models.PositiveIntegerField(default=5)
    auto_release_days = models.PositiveIntegerField(default=3)
    
    support_email = models.EmailField(blank=True)
    whatsapp_link = models.URLField(blank=True)

    def save(self, *args, **kwargs):
        if not self.pk and PlatformSettings.objects.exists():
            return
        return super(PlatformSettings, self).save(*args, **kwargs)

    def calculate_fee_breakdown(self, amount):
        """
        Calculates how much the client pays and how much the freelancer receives
        based on the fee_payer setting.
        """
        from decimal import Decimal
        amount = Decimal(str(amount))
        fee_percent = Decimal(str(self.platform_fee_percent))
        min_fee = Decimal(str(self.min_platform_fee))
        max_fee = Decimal(str(self.max_platform_fee))
        
        # Base calculation
        total_fee = (amount * fee_percent) / Decimal('100')
        
        # Apply Min/Max Logic (Hybrid)
        if min_fee > 0:
            total_fee = max(total_fee, min_fee)
        
        if max_fee > 0:
            total_fee = min(total_fee, max_fee)
            
        # Safety: Fee cannot exceed amount (for extremely small deals)
        if total_fee > amount:
            total_fee = amount
        
        client_fee = Decimal('0')
        freelancer_fee = Decimal('0')
        
        if self.fee_payer == 'client':
            client_fee = total_fee
        elif self.fee_payer == 'freelancer':
            freelancer_fee = total_fee
        elif self.fee_payer == 'split':
            client_fee = total_fee / Decimal('2')
            freelancer_fee = total_fee / Decimal('2')
            
        # Round to 2 decimal places for kobo precision
        def r2(val):
            return float(Decimal(str(val)).quantize(Decimal('0.01')))

        return {
            'base_amount': float(amount),
            'client_fee': r2(client_fee),
            'freelancer_fee': r2(freelancer_fee),
            'total_to_pay': r2(amount + client_fee),
            'total_to_receive': r2(amount - freelancer_fee),
            'platform_revenue': r2(client_fee + freelancer_fee)
        }

    class Meta:
        verbose_name_plural = "Platform Settings"

class JobType(models.Model):
    name = models.CharField(max_length=50) # e.g. development, design
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True) # Lucide icon name or similar

    def __str__(self):
        return self.name

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('message', 'New Message'),
        ('deal_accepted', 'Deal Accepted'),
        ('deal_approved', 'Deal Approved'),
        ('deal_delivered', 'Deal Delivered'),
        ('deal_funded', 'Deal Funded'),
        ('dispute', 'Dispute Opened'),
    )

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications_sent')
    deal = models.ForeignKey('deals.Deal', on_delete=models.CASCADE, null=True, blank=True)
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.type}"

# Import audit log model
from .audit import AdminAuditLog

class ThirdPartyIntegration(models.Model):
    SERVICE_CHOICES = (
        ('resend', 'Resend (Email)'),
        ('termii', 'Termii (SMS)'),
        ('cloudinary', 'Cloudinary (Storage)'),
        ('paystack', 'Paystack (Gateway)'),
        ('flutterwave', 'Flutterwave (Gateway)'),
    )
    service = models.CharField(max_length=50, choices=SERVICE_CHOICES, unique=True)
    public_key = models.CharField(max_length=255, blank=True)
    secret_key = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    config = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.get_service_display()

    class Meta:
        verbose_name = "Third-Party Integration"
        verbose_name_plural = "Third-Party Integrations"
