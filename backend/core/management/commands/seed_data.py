from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import PlatformSettings, JobType
from deals.models import Deal

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds database with initial data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # Settings
        if not PlatformSettings.objects.exists():
            PlatformSettings.objects.create(
                active_gateway='paystack',
                paystack_public_key='pk_test_sample',
                paystack_secret_key='sk_test_sample',
                platform_fee_percent=7.5
            )
            self.stdout.write('PlatformSettings created.')

        # Users
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
            self.stdout.write('Superuser created (admin/admin123).')
            
        client, created = User.objects.get_or_create(username='client', email='client@dealnest.ng', defaults={'role': 'client'})
        if created:
            client.set_password('client123')
            client.save()
        
        freelancer, created = User.objects.get_or_create(username='freelancer', email='free@dealnest.ng', defaults={'role': 'freelancer'})
        if created:
            freelancer.set_password('freelancer123')
            freelancer.save()
        
        self.stdout.write('Test users verified/created.')

        # Job Types
        types = ['Development', 'Design', 'Copywriting', 'Digital Product', 'Other']
        for name in types:
            JobType.objects.get_or_create(name=name, slug=name.lower().replace(' ', '_'))
        self.stdout.write('JobTypes created.')
        
        # Sample Deal
        dev_type = JobType.objects.get(slug='development')
        if not Deal.objects.filter(title='E-commerce Website').exists():
            Deal.objects.create(
                client=client,
                job_type=dev_type,
                title='E-commerce Website',
                description='Build a full e-commerce site with payment integration.',
                amount=150000,
                status='created'
            )
            self.stdout.write('Sample Deal created.')

        self.stdout.write(self.style.SUCCESS('Successfully seeded database'))
