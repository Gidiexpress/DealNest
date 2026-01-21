
import os
import requests
from dotenv import load_dotenv

# Load env from current directory
load_dotenv()

SECRET_KEY = os.getenv('PAYSTACK_SECRET_KEY')

if not SECRET_KEY:
    print("ERROR: PAYSTACK_SECRET_KEY not found in environment.")
    # Try hardcoding or failing gracefull
    # Assuming user has it in backend/.env
    # Let's try to look in backend/.env specifically
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    load_dotenv(env_path)
    SECRET_KEY = os.getenv('PAYSTACK_SECRET_KEY')

print(f"Testing with Key: {SECRET_KEY[:8]}..." if SECRET_KEY else "No Key Found")

if not SECRET_KEY:
    exit(1)

headers = {
    "Authorization": f"Bearer {SECRET_KEY}",
    "Content-Type": "application/json",
}

# 0. List Banks
print("\n--- Step 0: List Banks ---")
list_url = "https://api.paystack.co/bank"
res = requests.get(list_url, headers=headers)
if res.status_code == 200:
    banks = res.json()['data']
    for b in banks:
        if 'providus' in b['name'].lower() or 'test' in b['name'].lower():
            print(f"Found: {b['name']} ({b['code']})")
else:
    print("Could not list banks")

# 1. Try Resolving 
print("\n--- Step 1: Resolve Account (0000000000 @ 001) ---")
resolve_url = "https://api.paystack.co/bank/resolve"
params = {"account_number": "0000000000", "bank_code": "001"}
res = requests.get(resolve_url, headers=headers, params=params)
print(f"Status: {res.status_code}")
print(res.json())

# 2. Try Creating Recipient
print("\n--- Step 2: Create Recipient (0000000000 @ 001) ---")
url = "https://api.paystack.co/transferrecipient"
data = {
    "type": "nuban",
    "name": "Test Account",
    "account_number": "0000000000",
    "bank_code": "001",
    "currency": "NGN"
}
res = requests.post(url, json=data, headers=headers)
print(f"Status: {res.status_code}")
print(res.json())
