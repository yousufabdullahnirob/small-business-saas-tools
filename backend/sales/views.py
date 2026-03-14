from rest_framework import viewsets, filters
from config.utils import UserOwnedViewSet
from .models import Sale, CourierSettings
from .serializers import SaleSerializer, CourierSettingsSerializer
from .courier_service import CourierService
from rest_framework.decorators import api_view, permission_classes

class SaleViewSet(UserOwnedViewSet):
    queryset = Sale.objects.all().order_by('-created_at')
    serializer_class = SaleSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['invoice_number', 'customer__name']

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from inventory.models import Product
from customers.models import Customer
from django.db.models import Sum, Count, F, ExpressionWrapper, DecimalField
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings

class SalesInsightsAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now()
        last_7_days = today - timedelta(days=7)
        
        # Avoid circular imports
        from django.apps import apps
        SaleItem = apps.get_model('sales', 'SaleItem')
        
        # 1. Stock Out Prediction
        stock_out_risks = []
        products = Product.objects.filter(user=request.user, is_active=True)
        
        for product in products:
            recent_sold_qty = SaleItem.objects.filter(
                sale__user=request.user,
                sale__created_at__gte=last_7_days,
                product=product
            ).aggregate(total=Sum('quantity'))['total'] or 0
            
            daily_velocity = recent_sold_qty / 7.0
            
            days_remaining = 999 
            if daily_velocity > 0:
                days_remaining = int(product.stock_quantity / daily_velocity)
            
            if days_remaining <= 7 or product.stock_quantity <= product.low_stock_threshold:
                stock_out_risks.append({
                    "id": product.id,
                    "name": product.name,
                    "stock": product.stock_quantity,
                    "days_remaining": days_remaining if daily_velocity > 0 else "Low Stock",
                    "status": "Critical" if days_remaining <= 3 else "Warning"
                })
        
        stock_out_risks.sort(key=lambda x: x['days_remaining'] if isinstance(x['days_remaining'], int) else 999)

        # 2. Repeat Buyers
        repeat_buyers = Customer.objects.filter(user=request.user).annotate(
            order_count=Count('sale')
        ).filter(order_count__gt=1).order_by('-order_count')[:5]
        
        repeat_buyers_data = [{
            "id": c.id,
            "name": c.name,
            "order_count": c.order_count
        } for c in repeat_buyers]

        # 3. Best Sellers
        # Note: 'saleitem' is the related_query_name for ForeignKey from SaleItem to Product (default)
        top_products = Product.objects.filter(user=request.user).annotate(
            total_sold=Sum('saleitem__quantity')
        ).order_by('-total_sold')[:5]
        
        profitable_products = []
        for p in top_products:
             profitable_products.append({
                 "id": p.id,
                 "name": p.name,
                 "total_sold": p.total_sold or 0
             })

        return Response({
            "stock_out_predictions": stock_out_risks[:5],
            "repeat_buyers": repeat_buyers_data,
            "top_products": profitable_products
        })

class DashboardStatsAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Calculate stats
        total_sales_revenue = Sale.objects.filter(user=request.user, status='COMPLETED').aggregate(
            total=Sum('grand_total')
        )['total'] or 0
        
        total_orders_count = Sale.objects.filter(user=request.user).count()
        
        total_customers_count = Customer.objects.filter(user=request.user).count()
        
        return Response({
            "revenue": total_sales_revenue,
            "orders": total_orders_count,
            "total_sales": total_sales_revenue, # Duplicate for compatibility
            "total_orders": total_orders_count,
            "total_customers": total_customers_count
        })

class CourierSettingsAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        settings, created = CourierSettings.objects.get_or_create(user=request.user)
        serializer = CourierSettingsSerializer(settings)
        return Response(serializer.data)

    def post(self, request):
        settings, created = CourierSettings.objects.get_or_create(user=request.user)
        # We merge existing data with new data partial update
        serializer = CourierSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ship_order_api(request):
    sale_id = request.data.get('sale_id')
    weight = request.data.get('weight', 0.5)
    
    try:
        sale = Sale.objects.get(id=sale_id, user=request.user)
    except Sale.DoesNotExist:
        return Response({"error": "Sale not found"}, status=404)

    customer_name = request.data.get('customer_name')
    customer_phone = request.data.get('customer_phone')
    address = request.data.get('address')
    city = request.data.get('city')

    service = CourierService(request.user)
    result = service.create_order(sale, weight, customer_name, customer_phone, address, city)

    if result['success']:
        sale.courier_booking_id = result['tracking_code']
        sale.courier_status = "Booked"
        sale.save()

        # Send Email Notification
        try:
            subject = f"Order #{sale.id} Shipped - {result['tracking_code']}"
            message = f"Dear {sale.user.username},\n\nYour order #{sale.id} has been successfully booked with {result['provider']}.\n\nTracking Code: {result['tracking_code']}\nDelivery Fee: {result['delivery_fee']}\n\nCustomer: {customer_name}\nAddress: {address}\n\nThank you for using our Courier Integration."
            recipient_list = [sale.user.email]
            if sale.user.email:
                send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipient_list)
        except Exception as e:
            print(f"Failed to send email: {e}")

        return Response(result)
    else:
        return Response({"error": result['message']}, status=400)
