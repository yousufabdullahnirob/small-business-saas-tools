from rest_framework import serializers
from .models import Customer, Supplier

class CustomerSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Customer
        fields = '__all__'
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=Customer.objects.all(),
                fields=['user', 'phone'],
                message="A customer with this phone number already exists."
            )
        ]

class SupplierSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Supplier
        fields = '__all__'
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=Supplier.objects.all(),
                fields=['user', 'phone'],
                message="A supplier with this phone number already exists."
            )
        ]
