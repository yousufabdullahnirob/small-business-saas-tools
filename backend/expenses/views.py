from rest_framework import viewsets
from config.utils import UserOwnedViewSet
from .models import ExpenseCategory, Transaction
from .serializers import ExpenseCategorySerializer, TransactionSerializer

class ExpenseCategoryViewSet(UserOwnedViewSet):
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer

class TransactionViewSet(UserOwnedViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
