from django.urls import path
from .views import GenerateContentAPI

urlpatterns = [
    path('generate/', GenerateContentAPI.as_view(), name='generate-content'),
]
