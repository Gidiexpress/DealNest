import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dealnest.settings')
django.setup()

from core.emails import EmailService
from django.contrib.auth import get_user_model

User = get_user_model()

# Create dummy user
user = User(username="admin_tester", email="maxemmily@gmail.com")

print(f"DEBUG: EMAIL_HOST_USER = '{settings.EMAIL_HOST_USER}'")
print(f"DEBUG: DEFAULT_FROM_EMAIL = '{settings.DEFAULT_FROM_EMAIL}'")
mask_key = settings.EMAIL_HOST_PASSWORD[:5] + "..." if settings.EMAIL_HOST_PASSWORD else "None"
print(f"DEBUG: EMAIL_HOST_PASSWORD (Masked) = '{mask_key}'")

print("--- Testing Welcome Email ---")
EmailService.send_welcome_email(user)

print("\n--- Testing Payout Email ---")
EmailService.send_payout_email(user, 50000.00, "REF-123456")

print("\n--- Done ---")
