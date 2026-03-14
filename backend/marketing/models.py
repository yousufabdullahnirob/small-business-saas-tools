from django.db import models
from django.contrib.auth.models import User
from inventory.models import Product

class GeneratedContent(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    platform = models.CharField(max_length=50) # Facebook, Instagram, etc.
    content_type = models.CharField(max_length=50) # New Product, Discount, etc.
    generated_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.platform} post for {self.product.name if self.product else 'General'}"
