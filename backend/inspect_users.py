
import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import BusinessProfile

def inspect_users():
    ids = [6, 7]
    for user_id in ids:
        try:
            user = User.objects.get(id=user_id)
            print(f"User ID: {user.id}")
            print(f"  Username: {user.username}")
            print(f"  Email: {user.email!r}") # Use repr to see exact string validation
            try:
                profile = user.business_profile
                print(f"  Business: {profile.store_name}")
            except BusinessProfile.DoesNotExist:
                print("  Business: [No Profile]")
            print("-" * 20)
        except User.DoesNotExist:
            print(f"User {user_id} not found")

if __name__ == '__main__':
    inspect_users()
