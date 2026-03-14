import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from inventory.models import Product
from django.contrib.auth.models import User

print(f"Total Products: {Product.objects.count()}")
for user in User.objects.all():
    count = Product.objects.filter(user=user).count()
    print(f"User '{user.username}' (ID: {user.id}) has {count} products.")
    if count > 0:
        print("Products:")
        for p in Product.objects.filter(user=user):
            print(f" - {p.name} (ID: {p.id})")
