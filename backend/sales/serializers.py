from rest_framework import serializers
from .models import Sale, SaleItem
from .models import Sale, SaleItem, CourierSettings
from inventory.models import Product

class CourierSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourierSettings
        fields = ['id', 'provider', 'client_id', 'client_secret']
        extra_kwargs = {
            'client_secret': {'write_only': True} 
        }

class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'total_price']
        read_only_fields = ['total_price', 'product_name']

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Sale
        fields = ['id', 'invoice_number', 'customer', 'customer_name', 'payment_method', 
                  'sub_total', 'tax_amount', 'discount_amount', 'grand_total', 
                  'status', 'note', 'created_at', 'items', 'user',
                  'courier_booking_id', 'courier_status']
        read_only_fields = ['invoice_number', 'created_at', 'user']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        sale = Sale.objects.create(**validated_data)
        
        for item_data in items_data:
            product = item_data.get('product')
            quantity = item_data.get('quantity')
            unit_price = item_data.get('unit_price')
            
            # Simple stock decrement (should be more robust in production)
            if product:
                # Capture product name
                SaleItem.objects.create(
                    sale=sale,
                    product=product,
                    product_name=product.name,
                    quantity=quantity,
                    unit_price=unit_price
                )
                # Decrement stock
                product.stock_quantity -= quantity
                product.save()
            else:
                 SaleItem.objects.create(sale=sale, **item_data)

        return sale
