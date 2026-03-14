from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SubscriptionPlan, UserSubscription, GlobalPromotion
from .serializers import SubscriptionPlanSerializer, UserSubscriptionSerializer, GlobalPromotionSerializer
from django.utils import timezone
from datetime import timedelta

class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]

class UserSubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = UserSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserSubscription.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # In a real app, this would be handled after payment confirmation
        duration = serializer.validated_data.get('duration_months')
        end_date = timezone.now() + timedelta(days=30 * duration)
        serializer.save(user=self.request.user, end_date=end_date)

    @action(detail=False, methods=['get'])
    def current(self, request):
        subscription = UserSubscription.objects.filter(user=request.user, is_active=True).first()
        if subscription:
            serializer = self.get_serializer(subscription)
            return Response(serializer.data)
        return Response({"detail": "No active subscription found."}, status=status.HTTP_404_NOT_FOUND)

class GlobalPromotionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GlobalPromotion.objects.filter(is_active=True)
    serializer_class = GlobalPromotionSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def active(self, request):
        now = timezone.now()
        promo = GlobalPromotion.objects.filter(
            is_active=True,
            start_date__lte=now,
            end_date__gte=now
        ).first()
        if promo:
            serializer = self.get_serializer(promo)
            return Response(serializer.data)
        return Response({"detail": "No active promotion found."}, status=status.HTTP_404_NOT_FOUND)
