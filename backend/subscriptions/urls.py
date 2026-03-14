from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubscriptionPlanViewSet, UserSubscriptionViewSet, GlobalPromotionViewSet

router = DefaultRouter()
router.register(r'plans', SubscriptionPlanViewSet)
router.register(r'my-subscription', UserSubscriptionViewSet, basename='my-subscription')
router.register(r'promotions', GlobalPromotionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
