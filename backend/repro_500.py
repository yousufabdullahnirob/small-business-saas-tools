import os
import django
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Count

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from inventory.models import Product
from customers.models import Customer
# Use dynamic import as in the view
from django.apps import apps
SaleItem = apps.get_model('sales', 'SaleItem')

try:
    user = User.objects.get(username='admin')
    print(f"Testing with user: {user.username}")

    today = timezone.now()
    last_7_days = today - timedelta(days=7)

    print("DEBUG: Customer reverse relations:")
    for rel in Customer._meta.get_fields():
        if rel.is_relation and rel.auto_created:
            print(f" - {rel.get_accessor_name()}")

    print("1. Testing Stock Out Prediction...")
    stock_out_risks = []
    products = Product.objects.filter(user=user, is_active=True)
    
    for product in products:
        recent_sold_qty = SaleItem.objects.filter(
            sale__user=user,
            sale__created_at__gte=last_7_days,
            product=product
        ).aggregate(total=Sum('quantity'))['total'] or 0
        
        # print(f"Product: {product.name}, Sold: {recent_sold_qty}")
        
    print("Stock Out Prediction OK")

    print("2. Testing Repeat Buyers...")
    repeat_buyers = Customer.objects.filter(user=user).annotate(
        order_count=Count('sale')
    ).filter(order_count__gt=1).order_by('-order_count')[:5]
    print(f"Repeat Buyers found: {len(repeat_buyers)}")
    print("Repeat Buyers OK")

    print("3. Testing Best Sellers...")
    top_products = Product.objects.filter(user=user).annotate(
        total_sold=Sum('saleitem__quantity')
    ).order_by('-total_sold')[:5]
    
    print(f"Top Products found: {len(top_products)}")
    for p in top_products:
        print(f" - {p.name}: {p.total_sold}")
        
    print("Best Sellers OK. ALL LOGIC PASSED.")

except Exception as e:
    print("\nXXX CRASH DETECTED XXX")
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
