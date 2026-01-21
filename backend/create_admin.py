
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dealnest.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_admin():
    username = "admin"
    email = "admin@dealnest.com"
    password = "adminpassword123"
    
    if User.objects.filter(username=username).exists():
        print(f"Admin user '{username}' already exists.")
        user = User.objects.get(username=username)
        user.set_password(password) # Force password update
        user.is_staff = True
        user.is_superuser = True
        user.role = 'client' # Admins can act as clients for testing
        user.save()
        print(f"Updated password for '{username}' to '{password}'")
        print("Ensured permissions are set to Superuser.")
    else:
        user = User.objects.create_superuser(username=username, email=email, password=password)
        user.role = 'client'
        user.save()
        print(f"Superuser '{username}' created successfully.")
        print(f"Email: {email}")
        print(f"Password: {password}")

if __name__ == "__main__":
    create_admin()
