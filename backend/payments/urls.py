from django.urls import path
from .views import VerifyPaymentView, PaystackWebhookView, FlutterwaveWebhookView, BankListView, DepositInitializeView, WithdrawalView, FinalizeWithdrawalView
from .debug_views import PaystackDebugView

urlpatterns = [
    path('verify/', VerifyPaymentView.as_view(), name='payment_verify'),
    path('webhook/paystack/', PaystackWebhookView.as_view(), name='webhook_paystack'),
    path('webhook/flutterwave/', FlutterwaveWebhookView.as_view(), name='webhook_flutterwave'),
    path('banks/', BankListView.as_view(), name='bank_list'),
    path('deposit/initiate/', DepositInitializeView.as_view(), name='deposit_initiate'),
    path('withdraw/', WithdrawalView.as_view(), name='withdraw'),
    path('withdraw/finalize/', FinalizeWithdrawalView.as_view(), name='withdraw_finalize'),
    path('debug/', PaystackDebugView.as_view(), name='paystack_debug'),
]
