"""
Diagnostic endpoint to test Paystack integration directly
"""
from rest_framework import views, permissions
from rest_framework.response import Response
from django.conf import settings
from .services import get_gateway, PaystackGateway
from core.models import PlatformSettings
import uuid

class PaystackDebugView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Debug endpoint to test Paystack configuration"""
        debug_info = {
            'step': 'Starting diagnostics',
            'env_keys': {},
            'db_settings': {},
            'gateway_info': {},
            'bank_test': {},
            'init_test': {}
        }
        
        # Step 1: Check environment variables
        env_public = getattr(settings, 'PAYSTACK_PUBLIC_KEY', None)
        env_secret = getattr(settings, 'PAYSTACK_SECRET_KEY', None)
        debug_info['env_keys'] = {
            'public_key_set': bool(env_public),
            'secret_key_set': bool(env_secret),
            'public_key_preview': env_public[:20] + '...' if env_public else None,
            'secret_key_preview': env_secret[:20] + '...' if env_secret else None,
        }
        
        # Step 2: Check database settings
        try:
            db_settings = PlatformSettings.objects.first()
            if db_settings:
                debug_info['db_settings'] = {
                    'exists': True,
                    'active_gateway': db_settings.active_gateway,
                    'db_public_key_set': bool(db_settings.paystack_public_key),
                    'db_secret_key_set': bool(db_settings.paystack_secret_key),
                    'use_test_mode': db_settings.use_test_mode,
                }
            else:
                debug_info['db_settings'] = {'exists': False}
        except Exception as e:
            debug_info['db_settings'] = {'error': str(e)}
        
        # Step 3: Get gateway and check its keys
        try:
            gateway = get_gateway()
            debug_info['gateway_info'] = {
                'type': type(gateway).__name__,
                'has_secret_key': bool(gateway.secret_key),
                'secret_key_preview': gateway.secret_key[:20] + '...' if gateway.secret_key else None,
                'base_url': getattr(gateway, 'BASE_URL', None)
            }
        except Exception as e:
            debug_info['gateway_info'] = {'error': str(e)}
            return Response(debug_info)
        
        # Step 4: Test bank listing
        try:
            if hasattr(gateway, 'list_banks'):
                bank_result = gateway.list_banks()
                debug_info['bank_test'] = {
                    'status': bank_result.get('status'),
                    'message': bank_result.get('message'),
                    'bank_count': len(bank_result.get('data', [])) if bank_result.get('data') else 0,
                    'raw_status_type': type(bank_result.get('status')).__name__
                }
                if not bank_result.get('status'):
                    debug_info['bank_test']['full_response'] = bank_result
        except Exception as e:
            debug_info['bank_test'] = {'error': str(e)}
        
        # Step 5: Test payment initialization
        try:
            test_ref = f"TEST-{request.user.id}-{uuid.uuid4().hex[:8]}"
            init_result = gateway.initialize_payment(
                amount=100,
                email=request.user.email,
                reference=test_ref,
                callback_url="http://localhost:3000/test",
                metadata={'test': True}
            )
            debug_info['init_test'] = {
                'status': init_result.get('status'),
                'message': init_result.get('message'),
                'has_authorization_url': bool(init_result.get('data', {}).get('authorization_url')),
                'raw_status_type': type(init_result.get('status')).__name__
            }
            if not init_result.get('status'):
                debug_info['init_test']['full_response'] = init_result
        except Exception as e:
            debug_info['init_test'] = {'error': str(e)}
        
        debug_info['step'] = 'Diagnostics complete'
        return Response(debug_info)
