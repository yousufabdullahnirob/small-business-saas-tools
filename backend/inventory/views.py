from rest_framework import viewsets, filters
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from config.utils import UserOwnedViewSet
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

class CategoryViewSet(UserOwnedViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(UserOwnedViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'barcode', 'sku']
