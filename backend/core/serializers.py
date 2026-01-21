from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 
            'avatar', 'bio', 'kyc_status', 'email_verified', 'balance',
            'bank_name', 'bank_account', 'bank_account_name',
            'is_staff', 'is_superuser'
        ]
        read_only_fields = ['id', 'username', 'email', 'kyc_status', 'email_verified', 'balance', 'is_staff', 'is_superuser']

class PublicUserSerializer(serializers.ModelSerializer):
    """
    Limited serializer for public-facing data (other users viewing profile/deal).
    Hides sensitive info like balance, email, phone, bank details.
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'avatar', 'bio', 'role', 'kyc_status', 'email_verified']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'phone_number']
        extra_kwargs = {
            'phone_number': {'required': False, 'allow_blank': True}
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user

class NotificationSerializer(serializers.ModelSerializer):
    actor_username = serializers.ReadOnlyField(source='actor.username')
    
    class Meta:
        model = Notification
        fields = ['id', 'actor_username', 'type', 'content', 'is_read', 'created_at', 'deal']
