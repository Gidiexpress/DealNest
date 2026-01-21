"""
Diagnostic script that writes output to file
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dealnest.settings')

import django
django.setup()

from django.conf import settings
from payments.services import get_gateway, PaystackGateway
from core.models import PlatformSettings

output = []

def log(msg):
    output.append(str(msg))
    print(msg)

log('=' * 60)
log('PAYSTACK DIAGNOSTIC')
log('=' * 60)

log('\n[1] ENV VARS')
env_public = getattr(settings, 'PAYSTACK_PUBLIC_KEY', None)
env_secret = getattr(settings, 'PAYSTACK_SECRET_KEY', None)
log(f'PUBLIC: {env_public[:30] if env_public else "EMPTY"}...')
log(f'SECRET: {env_secret[:30] if env_secret else "EMPTY"}...')

log('\n[2] DB SETTINGS')
try:
    ps = PlatformSettings.objects.first()
    if ps:
        log(f'Gateway: {ps.active_gateway}')
        log(f'DB PK: {ps.paystack_public_key[:20] if ps.paystack_public_key else "EMPTY"}')
        log(f'DB SK: {ps.paystack_secret_key[:20] if ps.paystack_secret_key else "EMPTY"}')
    else:
        log('No PlatformSettings in DB')
except Exception as e:
    log(f'Error: {e}')

log('\n[3] GATEWAY')
try:
    gw = get_gateway()
    log(f'Type: {type(gw).__name__}')
    log(f'Key: {gw.secret_key[:30] if gw.secret_key else "EMPTY"}...')
except Exception as e:
    log(f'Error: {e}')

log('\n[4] BANK API TEST')
try:
    result = gw.list_banks()
    log(f'Status: {result.get("status")}')
    log(f'Msg: {result.get("message")}')
    if result.get('data'):
        log(f'Banks: {len(result["data"])}')
except Exception as e:
    log(f'Error: {e}')

log('\n[5] INIT PAYMENT TEST')
try:
    import uuid
    result = gw.initialize_payment(100, "test@test.com", f"T-{uuid.uuid4().hex[:6]}", "http://x.com", {})
    log(f'Status: {result.get("status")}')
    log(f'Msg: {result.get("message")}')
    if result.get('data', {}).get('authorization_url'):
        log('SUCCESS: Got auth URL')
except Exception as e:
    log(f'Error: {e}')

# Write to file
with open('diag_result.txt', 'w') as f:
    f.write('\n'.join(output))

log('\nDONE - see diag_result.txt')
