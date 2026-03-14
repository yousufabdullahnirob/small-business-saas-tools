from django.db import models
from django.contrib.auth.models import User

class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    
    # Pricing for different durations
    price_1m = models.DecimalField(max_digits=10, decimal_places=2)
    price_3m = models.DecimalField(max_digits=10, decimal_places=2)
    price_6m = models.DecimalField(max_digits=10, decimal_places=2)
    price_12m = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Original prices (for UI display of discounts)
    original_price_1m = models.DecimalField(max_digits=10, decimal_places=2)
    original_price_3m = models.DecimalField(max_digits=10, decimal_places=2)
    original_price_6m = models.DecimalField(max_digits=10, decimal_places=2)
    original_price_12m = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Limits
    team_members_limit = models.IntegerField(default=1)
    warehouses_limit = models.IntegerField(default=1)
    monthly_invoices_limit = models.IntegerField(default=500)
    free_trial_days = models.IntegerField(default=14)
    
    # Features as JSON
    features = models.JSONField(default=list)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class UserSubscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True)
    duration_months = models.IntegerField(choices=[(1, '1 Month'), (3, '3 Months'), (6, '6 Months'), (12, '12 Months')])
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.plan.name if self.plan else 'No Plan'}"

class GlobalPromotion(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    discount_percentage = models.IntegerField(default=0)
    banner_text_en = models.CharField(max_length=200)
    banner_text_bn = models.CharField(max_length=200)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
