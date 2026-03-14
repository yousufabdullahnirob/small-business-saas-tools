from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
import uuid

class CourierSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='courier_settings')
    provider = models.CharField(max_length=50, default='Pathao')
    client_id = models.CharField(max_length=255, blank=True)
    client_secret = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.provider}"

class Sale(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sales', null=True, blank=True)
    PAYMENT_METHODS = [
        ('CASH', 'Cash'),
        ('CARD', 'Card'),
        ('MOBILE', 'Mobile Banking'),
        ('OTHER', 'Other'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    invoice_number = models.CharField(max_length=50, unique=True, editable=False)
    customer = models.ForeignKey('customers.Customer', on_delete=models.SET_NULL, null=True, blank=True)
    
    sub_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='CASH')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='COMPLETED')
    
    # Courier Fields
    courier_booking_id = models.CharField(max_length=100, blank=True, null=True)
    courier_status = models.CharField(max_length=50, blank=True, null=True)

    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            # Simple invoice generation: INV-YYYYMMDD-UUID
            date_str = timezone.now().strftime('%Y%m%d')
            uid = str(uuid.uuid4())[:6].upper()
            self.invoice_number = f"INV-{date_str}-{uid}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.invoice_number

class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey('inventory.Product', on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=200) # Snapshot in case product is deleted
    
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    
    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"
