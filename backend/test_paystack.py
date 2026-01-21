"""
Quick test script to verify Paystack API keys are working
Run with: python test_paystack.py
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dealnest.settings')
django.setup()

from payments.services import get_gateway, PaystackGateway
from django.conf import settings

print("=" * 50)
print("Paystack API Configuration Test")
print("=" * 50)

# Check settings
print(f"\nPAYSTACK_PUBLIC_KEY: {'Set' if settings.PAYSTACK_PUBLIC_KEY else 'NOT SET'}")
print(f"PAYSTACK_SECRET_KEY: {'Set' if settings.PAYSTACK_SECRET_KEY else 'NOT SET'}")

if settings.PAYSTACK_SECRET_KEY:
    print(f"Secret Key Preview: {settings.PAYSTACK_SECRET_KEY[:15]}...")

# Test gateway
print("\n--- Testing Gateway ---")
gateway = get_gateway()
print(f"Gateway Type: {type(gateway).__name__}")

if isinstance(gateway, PaystackGateway):
    print("\n--- Testing Bank List API ---")
    banks = gateway.list_banks()
    if banks.get('status'):
        print(f"SUCCESS: Retrieved {len(banks.get('data', []))} banks")
        if banks.get('data'):
            print(f"Sample: {banks['data'][0]['name']}")
    else:
        print(f"FAILED: {banks.get('message', banks)}")
    
    print("\n--- Testing Transaction Initialize ---")
    test_result = gateway.initialize_payment(
        amount=100,
        email="test@example.com",
        reference="TEST-123-" + str(os.urandom(4).hex()),
        callback_url="http://localhost:3000/dashboard",
        metadata={"test": True}
    )
    if test_result.get('status'):
        print(f"SUCCESS: Got authorization URL")
        print(f"URL: {test_result['data']['authorization_url'][:50]}...")
    else:
        print(f"FAILED: {test_result.get('message', test_result)}")
else:
    print("Gateway is not Paystack")

print("\n" + "=" * 50)
print("Test Complete")
print("=" * 50)
