"""
Check notification content and test balance update
"""
import os
import sys
import django
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dealnest.settings')
django.setup()

from core.models import User, Notification
from payments.models import PaymentTransaction

print('='*50)
print('USER & NOTIFICATIONS')
print('='*50)

user = User.objects.first()
print(f"User: {user.username} | Balance: {user.balance} | Type: {type(user.balance)}")

notifs = Notification.objects.filter(recipient=user).order_by('-created_at')[:3]
for n in notifs:
    print(f"[{n.created_at.strftime('%H:%M:%S')}] {n.content}")

print('\n' + '='*50)
print('BALANCE UPDATE TEST')
print('='*50)

base_bal = Decimal('0.00')
add_float = 10000.0
new_bal = base_bal + Decimal(add_float)
print(f"Decimal(0) + float(10000.0) -> Decimal({add_float}) = {new_bal}")

# Check if direct float addition works (it might fail in python if not cast)
try:
    direct = base_bal + add_float
    print(f"Direct add result: {direct}")
except Exception as e:
    print(f"Direct add failed: {e}")

# Check transaction amount type
tx = PaymentTransaction.objects.last()
if tx:
    print(f"TX Amount: {tx.amount_paid} | Type: {type(tx.amount_paid)}")
