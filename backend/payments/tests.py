from django.test import TestCase
from unittest.mock import patch, MagicMock
from core.models import User, PlatformSettings
from deals.models import Deal, JobType
from .services import get_gateway, PaystackGateway, FlutterwaveGateway

class PaymentServiceTestCase(TestCase):
    def setUp(self):
        self.settings = PlatformSettings.objects.create(
            active_gateway='paystack',
            paystack_secret_key='sk_test_mock',
            use_test_mode=True
        )
        self.user = User.objects.create_user(username='testclient', email='client@example.com')
        self.job_type = JobType.objects.create(name='Dev', slug='dev')
        self.deal = Deal.objects.create(
            client=self.user,
            job_type=self.job_type,
            title='Test Deal',
            description='Desc',
            amount=5000
        )

    @patch('requests.post')
    def test_paystack_initialization(self, mock_post):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            'status': True, 
            'data': {'authorization_url': 'https://paystack.com/pay/xxx', 'reference': 'ref123'}
        }
        mock_post.return_value = mock_response

        gateway = get_gateway()
        result = gateway.initialize_payment(5000, 'client@example.com', 'ref123', 'http://callback.url')
        
        self.assertTrue(result['status'])
        self.assertEqual(result['data']['authorization_url'], 'https://paystack.com/pay/xxx')
        
    @patch('requests.get')
    def test_paystack_verification_success(self, mock_get):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            'status': True,
            'data': {'status': 'success', 'amount': 500000, 'reference': 'ref123'}
        }
        mock_get.return_value = mock_response

        gateway = get_gateway()
        verification = gateway.verify_payment('ref123')
        
        self.assertTrue(verification['status'])
        self.assertEqual(verification['data']['status'], 'success')

    @patch('requests.post')
    def test_flutterwave_initialization(self, mock_post):
        # Switch to FW
        self.settings.active_gateway = 'flutterwave'
        self.settings.flutterwave_secret_key = 'flw_sec_mock'
        self.settings.save()

        mock_response = MagicMock()
        mock_response.json.return_value = {
            'status': 'success',
            'data': {'link': 'https://flutterwave.com/pay/xxx'}
        }
        mock_post.return_value = mock_response

        gateway = get_gateway()
        result = gateway.initialize_payment(5000, 'client@example.com', 'ref456', 'http://callback.url', {})
        
        self.assertEqual(result['status'], 'success')
        self.assertEqual(result['data']['link'], 'https://flutterwave.com/pay/xxx')
