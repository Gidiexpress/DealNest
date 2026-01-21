from rest_framework import views, permissions, response, status, parsers
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()

class RequestVerificationView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def post(self, request):
        user = request.user
        
        if user.kyc_status in ['pending', 'full', 'basic']:
             return response.Response({"error": f"Verification already {user.kyc_status}"}, status=400)
             
        if 'document' not in request.FILES:
             return response.Response({"error": "Document file is required"}, status=400)
             
        document = request.FILES['document']
        
        # Simple validation
        if document.size > 5 * 1024 * 1024: # 5MB limit
             return response.Response({"error": "File too large (max 5MB)"}, status=400)
             
        user.kyc_document = document
        user.kyc_status = 'pending'
        user.save()
        
        # Notify Admins (For MVP, we just log it or maybe create a generic admin notification if system existed)
        # We don't have a direct 'notify all admins' function yet, but the Admin Dashboard sees pending users.
        
        return response.Response({
            "status": "success",
            "message": "Verification requested. Admin will review your document.",
            "kyc_status": "pending"
        })
