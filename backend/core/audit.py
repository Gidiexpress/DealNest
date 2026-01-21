from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class AdminAuditLog(models.Model):
    """
    Security: Track all admin actions for accountability and security monitoring
    """
    admin = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='admin_actions')
    action = models.CharField(max_length=100)  # "update_settings", "ban_user", etc.
    target_model = models.CharField(max_length=50, blank=True)  # "PlatformSettings", "User"
    target_id = models.IntegerField(null=True, blank=True)
    changes = models.JSONField(default=dict)  # {"old_value": X, "new_value": Y}
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['admin', '-timestamp']),
            models.Index(fields=['action', '-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.admin.username if self.admin else 'Unknown'} - {self.action} - {self.timestamp}"
