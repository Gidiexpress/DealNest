from payments.models import PaymentTransaction
from core.models import PlatformSettings
try:
    tx = PaymentTransaction.objects.latest('created_at')
    deal = tx.deal
    settings = PlatformSettings.objects.first()
    breakdown = settings.calculate_fee_breakdown(deal.amount)
    print(f"DEBUG: Deal={deal.id}, Amount={deal.amount}, Status={deal.status}")
    print(f"DEBUG: Breakdown Total={breakdown['total_to_pay']}")
    print(f"DEBUG: Paid Amount={tx.amount_paid}")
    print(f"DEBUG: Match={abs(float(tx.amount_paid) - breakdown['total_to_pay']) <= 1.0}")
except Exception as e:
    print(f"ERROR: {e}")
