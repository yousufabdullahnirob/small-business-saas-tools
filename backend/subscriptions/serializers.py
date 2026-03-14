from rest_framework import serializers
from .models import SubscriptionPlan, UserSubscription, GlobalPromotion

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'

class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan_details = SubscriptionPlanSerializer(source='plan', read_only=True)
    
    class Meta:
        model = UserSubscription
        fields = ['id', 'plan', 'plan_details', 'duration_months', 'start_date', 'end_date', 'is_active']
        read_only_fields = ['start_date', 'is_active']

class GlobalPromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalPromotion
        fields = '__all__'
