from django.db import models
from django.conf import settings

class PaymentTransaction(models.Model):
    GATEWAY_CHOICES = (
        ('paystack', 'Paystack'),
        ('flutterwave', 'Flutterwave'),
        ('wallet', 'Wallet'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    )

    TYPE_CHOICES = (
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
        ('deal_payment', 'Deal Payment'),
        ('payout', 'Payout'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions', null=True, blank=True)
    deal = models.ForeignKey('deals.Deal', on_delete=models.CASCADE, related_name='transactions', null=True, blank=True)
    gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES)
    reference = models.CharField(max_length=100, unique=True)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='deal_payment')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    raw_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.gateway} {self.reference} - {self.status}"

class Payout(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    )

    deal = models.ForeignKey('deals.Deal', on_delete=models.CASCADE, related_name='payouts')
    freelancer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    bank_details_snapshot = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reference = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payout {self.amount} to {self.freelancer}"
