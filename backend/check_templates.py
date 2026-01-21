import os
from django.conf import settings
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dealnest.settings')
django.setup()

print(f"BASE_DIR: {settings.BASE_DIR}")
print(f"TEMPLATES DIRS: {settings.TEMPLATES[0]['DIRS']}")
for d in settings.TEMPLATES[0]['DIRS']:
    print(f"Searching in: {d}")
    if os.path.exists(d):
        print(f"  Directory exists!")
        idx = os.path.join(d, 'admin', 'index.html')
        if os.path.exists(idx):
             print(f"  FOUND index.html at {idx}")
             with open(idx, 'r') as f:
                 first_line = f.readline()
                 print(f"  First line: {first_line.strip()}")
        else:
             print(f"  index.html NOT found at {idx}")
    else:
        print(f"  Directory does NOT exist!")
