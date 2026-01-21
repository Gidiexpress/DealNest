from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class EmailOrUsernameBackend(ModelBackend):
    """
    Custom authentication backend that allows users to log in using either
    their username or their email address.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        
        try:
            # Check for username OR email
            user = User.objects.get(Q(username__iexact=username) | Q(email__iexact=username))
        except User.DoesNotExist:
            # Run the default password hasher to prevent timing attacks
            User().set_password(password)
            return None
        except User.MultipleObjectsReturned:
            # Fallback if multiple users have same email/username (shouldn't happen with unique constraints)
            user = User.objects.filter(Q(username__iexact=username) | Q(email__iexact=username)).first()

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
