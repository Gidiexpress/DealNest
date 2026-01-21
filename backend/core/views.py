from rest_framework import generics, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer, NotificationSerializer
from .models import Notification, PlatformSettings

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        from .emails import EmailService
        EmailService.send_welcome_email(user)

class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
    
    def post(self, request, *args, **kwargs):
        # Allow POST to verify email if action logic is here? 
        # Actually UserDetailView is generic, doesn't support @action.
        # We need a ViewSet or a separate APIView for actions.
        # Let's create a separate ViewSet for user actions or add a new URL.
        return self.update(request, *args, **kwargs)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def verify_email(self, request):
         user = request.user
         user.email_verified = True
         user.kyc_status = 'basic'
         user.save()
         return Response({'status': 'verified', 'message': 'Email verified successfully'})

class PublicProfileView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer
    lookup_field = 'username'

from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
import os

class FileUploadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_obj = request.data.get('file')
        if not file_obj:
            return Response({"error": "No file provided"}, status=400)
            
        # Save file
        file_name = default_storage.save(f"uploads/{file_obj.name}", file_obj)
        # Use request.build_absolute_uri to get full URL if needed, or just relative
        file_url = request.build_absolute_uri(default_storage.url(file_name))
        
        return Response({
            "url": file_url,
            "name": file_obj.name,
            "type": file_obj.content_type,
            "size": file_obj.size
        }, status=201)

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'success'})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'success'})

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        try:
            notification = Notification.objects.get(id=id, recipient=request.user)
            notification.is_read = True
            notification.save()
            return Response({'status': 'success'})
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=404)

class PlatformSettingsView(APIView):
    permission_classes = [permissions.AllowAny] # Using AllowAny so register/login can potentially see public keys if needed, or IsAuthenticated

    def get(self, request):
        settings = PlatformSettings.objects.first()
        if not settings:
            return Response({})
            
        return Response({
            'active_gateway': settings.active_gateway,
            'paystack_public_key': settings.paystack_public_key,
            'flutterwave_public_key': settings.flutterwave_public_key,
            'use_test_mode': settings.use_test_mode,
            'platform_fee_percent': settings.platform_fee_percent,
        })
