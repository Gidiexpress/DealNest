"""
Check the raw response of the last transaction to verify structure
"""
import os
import sys
import django
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dealnest.settings')
django.setup()

from payments.models import PaymentTransaction

print('='*50)
print('LAST TRANSACTION DEBUG')
print('='*50)

tx = PaymentTransaction.objects.order_by('-created_at').first()
if tx:
    print(f"Ref: {tx.reference}")
    print(f"Amount Logic: {tx.amount_paid}")
    print(f"Raw Response Type: {type(tx.raw_response)}")
    
    if tx.raw_response:
        try:
            # If it's a string, load it. If dict, dump it.
            data = tx.raw_response
            if isinstance(data, str):
                data = json.loads(data)
            
            print(json.dumps(data, indent=2))
            
            # Simulate parsing logic
            amt_kobo = data.get('data', {}).get('amount')
            print(f"\nParsing Check:")
            print(f"data.get('data', {{}}).get('amount'): {amt_kobo}")
            if amt_kobo:
                print(f"Calculated Naira: {float(amt_kobo) / 100}")
            
            # Check for webhook structure vs verify structure
            if 'event' in data:
                print("Type: Webhook Event")
                wb_amt = data.get('data', {}).get('amount')
                print(f"Webhook Amount Access: {wb_amt}")
            else:
                print("Type: Verify Response")
                
        except Exception as e:
            print(f"Error parsing raw response: {e}")
            print(tx.raw_response)
else:
    print("No transactions found.")
