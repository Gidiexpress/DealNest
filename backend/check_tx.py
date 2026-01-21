"""
Check recent transactions and user balance
"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dealnest.settings')
django.setup()

from payments.models import PaymentTransaction
from core.models import User

print('='*50)
print('RECENT TRANSACTIONS')
print('='*50)

txs = PaymentTransaction.objects.all().order_by('-created_at')[:5]
if txs:
    for t in txs:
        print(f"Ref: {t.reference} | Type: {t.transaction_type} | Amt: {t.amount_paid} | Status: {t.status} | User: {t.user.username if t.user else 'None'}")
else:
    print("No transactions found.")

print('\n' + '='*50)
print('USER BALANCES')
print('='*50)
users = User.objects.all()
for u in users:
    print(f"User: {u.username} | Balance: {u.balance}")
