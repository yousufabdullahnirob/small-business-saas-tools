import requests
import json
import random
from .models import CourierSettings

class CourierService:
    def __init__(self, user):
        self.user = user
        try:
            self.settings = CourierSettings.objects.get(user=user)
        except CourierSettings.DoesNotExist:
            self.settings = None

    def create_order(self, sale, weight, customer_name, customer_phone, address, city, notes=""):
        if not self.settings:
            return {"success": False, "message": "Courier settings not found. Please configure in Settings."}

        provider = self.settings.provider.lower()
        
        if not self.settings.client_id:
            return {"success": False, "message": f"Please provide API Keys for {self.settings.provider}."}

        # In a real scenario, this would call the actual API
        if provider == 'pathao':
            return self._create_pathao_order(sale, weight, customer_name, customer_phone, address, city, notes)
        elif provider == 'steadfast':
            return self._create_steadfast_order(sale, weight, customer_name, customer_phone, address, city, notes)
        else:
            return {"success": False, "message": "Unsupported provider."}

    def _create_pathao_order(self, sale, weight, customer_name, customer_phone, address, city, notes):
        # SIMULATION OF PATHAO API CALL
        # Real Endpoint: https://api-hermes.pathao.com/aladdin/api/v1/orders
        
        # Verify credentials "exist" (simple check)
        if len(self.settings.client_id) < 3:
             return {"success": False, "message": "Invalid Client ID."}

        # Simulate success
        tracking_code = f"PTH-{random.randint(100000, 999999)}"
        
        return {
            "success": True,
            "tracking_code": tracking_code,
            "provider": "Pathao",
            "delivery_fee": 60 + (float(weight) * 10) # Mock calculation
        }

    def _create_steadfast_order(self, sale, weight, customer_name, customer_phone, address, city, notes):
        # SIMULATION OF STEADFAST API CALL
        tracking_code = f"SF-{random.randint(100000, 999999)}"
        
        return {
            "success": True,
            "tracking_code": tracking_code,
            "provider": "Steadfast",
            "delivery_fee": 70 # Flat rate mock
        }
