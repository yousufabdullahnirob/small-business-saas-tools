from django.db import models
from django.contrib.auth.models import User

class BusinessProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='business_profile')
    store_name = models.CharField(max_length=200, default="My Store")
    # AI Customization Fields
    product_category = models.CharField(max_length=100, default="General", help_text="E.g., Fashion, Electronics, Food")
    target_customer = models.CharField(max_length=200, default="Everyone", help_text="E.g., Men 20-30, Housewives, Students")
    business_language = models.CharField(max_length=20, default="Bangla", help_text="Bangla / English / Mixed")
    communication_tone = models.CharField(max_length=50, default="Friendly", help_text="Friendly / Professional / Aggressive")

    currency = models.CharField(max_length=10, default="USD")
    language = models.CharField(max_length=10, default="en")
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Business"
