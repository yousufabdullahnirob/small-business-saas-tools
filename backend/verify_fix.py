
import os
import django
import sys
from rest_framework.exceptions import ValidationError

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.serializers import UserSerializer
from django.contrib.auth.models import User

def verify_fix():
    # Ensure baseline user exists
    email = "testuniqueness@example.com"
    username = "testuniqueuser"
    
    # Clean up if exists
    User.objects.filter(username=username).delete()
    User.objects.create_user(username=username, email=email, password="password123")
    print(f"Created baseline user: {email}")

    # Attempt to create duplicate with different case
    duplicate_email = "TestUniqueness@Example.com"
    data = {
        "username": "duplicateuser",
        "email": duplicate_email,
        "password": "password123"
    }
    
    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        print("FAIL: Serializer considered duplicate email valid!")
        user = serializer.save()
        print(f"Created duplicate user: {user.email}")
    else:
        print("SUCCESS: Serializer rejected duplicate email.")
        print("Errors:", serializer.errors)

if __name__ == '__main__':
    verify_fix()
