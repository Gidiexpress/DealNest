import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dealnest.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def check_admin():
    try:
        admin = User.objects.get(username="admin")
        print(f"Username: {admin.username}")
        print(f"Email: {admin.email}")
        print(f"is_staff: {admin.is_staff}")
        print(f"is_superuser: {admin.is_superuser}")
        print(f"is_active: {admin.is_active}")
        print(f"role: {admin.role}")
        print("\n✓ Admin user found and verified!")
    except User.DoesNotExist:
        print("✗ Admin user not found!")

if __name__ == "__main__":
    check_admin()
