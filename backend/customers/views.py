from rest_framework import viewsets, filters
from config.utils import UserOwnedViewSet
from .models import Customer, Supplier
from .serializers import CustomerSerializer, SupplierSerializer

class CustomerViewSet(UserOwnedViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'phone', 'email']

class SupplierViewSet(UserOwnedViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'contact_person', 'phone']
