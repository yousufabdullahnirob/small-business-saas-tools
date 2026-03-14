from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SaleViewSet, SalesInsightsAPI, CourierSettingsAPI, ship_order_api

router = DefaultRouter()
router.register(r'sales', SaleViewSet)

urlpatterns = [
    path('insights/', SalesInsightsAPI.as_view(), name='sales-insights'),
    path('courier-settings/', CourierSettingsAPI.as_view(), name='courier-settings'),
    path('ship-order/', ship_order_api, name='ship-order'),
    path('', include(router.urls)),
]
