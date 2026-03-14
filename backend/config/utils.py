from rest_framework import viewsets, permissions

class UserOwnedViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Allow filtering by user for isolation
        if self.request.user.is_authenticated:
            return self.queryset.filter(user=self.request.user)
        return self.queryset.none() # Return nothing if not authenticated

    def perform_create(self, serializer):
        # Force the user to be the current authenticated user on creation
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        # Prevent changing the owner of the record
        serializer.save(user=self.request.user)
