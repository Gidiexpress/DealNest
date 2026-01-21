
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dealnest.settings')
django.setup()

from core.models import JobType

types = [
    {'name': 'Web Development', 'slug': 'web-dev'},
    {'name': 'Graphic Design', 'slug': 'design'},
    {'name': 'Writing', 'slug': 'writing'},
    {'name': 'Marketing', 'slug': 'marketing'}
]

for t in types:
    JobType.objects.get_or_create(slug=t['slug'], defaults={'name': t['name']})
    print(f"Ensured {t['name']} exists")
