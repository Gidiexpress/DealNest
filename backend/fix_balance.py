"""
Manually fix user balance for the stuck transaction
"""
import os
import sys
import django
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dealnest.settings')
django.setup()

from core.models import User
from payments.models import PaymentTransaction

print('='*50)
print('MANUAL BALANCE CORRECTION')
print('='*50)

user = User.objects.get(email='johndoe@example.com') # Assuming johndoe
print(f"User: {user.username} | Current Balance: {user.balance}")

# Find the transaction
tx = PaymentTransaction.objects.filter(reference='DEP-8-426fe350').first()
if tx:
    print(f"Reference: {tx.reference} | Amount: {tx.amount_paid} | Status: {tx.status}")
    
    # Check if we should credit
    if user.balance == Decimal('0.00') and tx.status == 'success':
        print("\nApplying correction...")
        user.balance += tx.amount_paid
        user.save()
        print(f"SUCCESS: New Balance is {user.balance}")
    else:
        print("\nNo correction needed (Balance already updated or transaction invalid).")
else:
    print("Transaction not found!")

# Verify
user.refresh_from_db()
print(f"Final Balance: {user.balance}")
