import os
import django
import sys
from django.core.files.uploadedfile import SimpleUploadedFile

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from inventory.models import Product
from django.contrib.auth.models import User

try:
    admin_user = User.objects.get(username='admin')
    
    # Check if admin already has products
    if Product.objects.filter(user=admin_user).exists():
        print("Admin already has products.")
    else:
        print("Creating demo product for admin...")
        Product.objects.create(
            user=admin_user,
            name="Classic Leather Bag",
            description="Premium handmade leather bag",
            price=5000,
            stock_quantity=10,
            sku="BAG-001"
        )
        print("Product 'Classic Leather Bag' created successfully for admin!")

except User.DoesNotExist:
    print("User 'admin' does not exist!")
