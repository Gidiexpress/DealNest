from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.utils.crypto import get_random_string
import uuid

User = settings.AUTH_USER_MODEL

class Deal(models.Model):
    STATUS_CHOICES = (
        ('created', 'Created'),
        ('funded', 'Funded'),
        ('in_progress', 'In Progress'),
        ('delivered', 'Delivered'),
        ('completed', 'Completed'),
        ('disputed', 'Disputed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    )

    reference_id = models.CharField(max_length=20, unique=True, blank=True, null=True)

    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='deals_as_client')
    freelancer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='deals_as_freelancer')
    job_type = models.ForeignKey('core.JobType', on_delete=models.SET_NULL, null=True)
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='NGN')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='created')
    milestones = models.JSONField(default=list, blank=True)
    
    dispute_window_expires = models.DateTimeField(null=True, blank=True)
    unique_shareable_url = models.SlugField(unique=True, blank=True)
    attachments = models.JSONField(default=list, blank=True)
    
    # New fields for enhanced details
    deadline = models.DateField(null=True, blank=True)
    requirements = models.TextField(blank=True, help_text="Key features and deliverables expected")
    revision_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.unique_shareable_url:
            self.unique_shareable_url = slugify(self.title[:50]) + '-' + get_random_string(8)
        
        if not self.reference_id:
            # Generate DN-DL-XXXXXX format
            unique_code = get_random_string(8, allowed_chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789')
            self.reference_id = f"DN-DL-{unique_code}"
            # Ensure uniqueness
            while Deal.objects.filter(reference_id=self.reference_id).exists():
                unique_code = get_random_string(8, allowed_chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789')
                self.reference_id = f"DN-DL-{unique_code}"
        
        super(Deal, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"

class DealSubmission(models.Model):
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='submissions')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE)
    
    links = models.JSONField(default=list, blank=True, help_text="List of links like GitHub, Drive, etc.")
    files = models.JSONField(default=list, blank=True, help_text="List of uploaded file URLs")
    notes = models.TextField(blank=True)
    
    revision_round = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Submission for {self.deal} - Round {self.revision_round}"

class DealMessage(models.Model):
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    files = models.JSONField(default=list, blank=True) # or separate File model
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message by {self.user} on {self.deal}"

class Dispute(models.Model):
    DECISION_CHOICES = (
        ('release_to_freelancer', 'Release to Freelancer'),
        ('partial_refund', 'Partial Refund'),
        ('full_refund', 'Full Refund'),
    )

    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='disputes')
    opened_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='opened_disputes')
    reason = models.TextField()
    evidence_files = models.JSONField(default=list, blank=True)
    reference_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
    
    admin_decision = models.CharField(max_length=50, choices=DECISION_CHOICES, blank=True, null=True)
    decision_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Dispute for {self.deal}"

    def save(self, *args, **kwargs):
        if not self.reference_id:
            # Generate DN-DS-XXXXXX format
            unique_code = get_random_string(8, allowed_chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789')
            self.reference_id = f"DN-DS-{unique_code}"
            # Ensure uniqueness
            while Dispute.objects.filter(reference_id=self.reference_id).exists():
                unique_code = get_random_string(8, allowed_chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789')
                self.reference_id = f"DN-DS-{unique_code}"
        super(Dispute, self).save(*args, **kwargs)
