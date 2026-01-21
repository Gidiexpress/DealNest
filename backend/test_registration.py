import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dealnest.settings')
django.setup()

from core.serializers import RegisterSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# Test data
data = {
    "username": "testuser_unique_123",
    "email": "test@example.com",
    "password": "testpassword123",
    "role": "client"
}

print(f"Attempting to register user: {data['username']}")

serializer = RegisterSerializer(data=data)
if serializer.is_valid():
    try:
        user = serializer.save()
        print(f"SUCCESS: User {user.username} created!")
        # Clean up
        user.delete()
        print("Cleanup: Test user deleted.")
    except Exception as e:
        print(f"FAILURE during save: {str(e)}")
else:
    print(f"FAILURE validation: {serializer.errors}")

# Test with duplicate username
print("\nTesting duplicate username...")
serializer = RegisterSerializer(data=data)
# Re-creating a user with same name to test duplicate
User.objects.create_user(username=data['username'], email=data['email'], password=data['password'])
serializer = RegisterSerializer(data=data)
if serializer.is_valid():
    print("Error: Validation should have failed for duplicate username")
else:
    print(f"Expected failure: {serializer.errors}")

# Clean up again
User.objects.filter(username=data['username']).delete()
