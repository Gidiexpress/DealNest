import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dealnest.settings")
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

def test_admin_stats():
    print("--- Testing Admin Stats Endpoint ---")
    client = APIClient()
    
    # Ensure admin user exists
    admin_user, created = User.objects.get_or_create(username="admin_test", email="admin@test.com", role="client")
    if created:
        admin_user.set_password("password")
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()
        print("Created admin user")
    
    client.force_authenticate(user=admin_user)
    
    response = client.get('/api/admin/stats/')
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Response Data:", response.json())
    else:
        print("Error:", response.content)

if __name__ == "__main__":
    test_admin_stats()
