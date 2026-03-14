from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories', null=True, blank=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"

class Product(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products', null=True, blank=True)
    name = models.CharField(max_length=200)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Selling Price")
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Cost Price", default=0)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Tax rate in percentage")
    
    # Stock
    stock_quantity = models.IntegerField(default=0)
    low_stock_threshold = models.IntegerField(default=10, help_text="Alert when stock is below this level")
    
    # Identification
    barcode = models.CharField(max_length=100, blank=True, null=True)
    sku = models.CharField(max_length=100, blank=True, null=True)
    
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        unique_together = [['user', 'barcode'], ['user', 'sku']]
