
import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

def delete_user():
    try:
        user = User.objects.get(id=7)
        print(f"Deleting User ID: {user.id}, Username: {user.username}")
        user.delete()
        print("Deletion successful.")
    except User.DoesNotExist:
        print("User already deleted.")

if __name__ == '__main__':
    delete_user()
