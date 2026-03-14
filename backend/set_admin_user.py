
import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

def set_admin_user():
    username = "nirob"
    password = "nirob"
    email = "nirob@example.com"  # Default email if creating new

    try:
        user = User.objects.get(username=username)
        print(f"User '{username}' found. Updating credentials...")
    except User.DoesNotExist:
        print(f"User '{username}' not found. Creating new superuser...")
        user = User(username=username, email=email)

    user.set_password(password)
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.save()
    print(f"Successfully set superuser '{username}' with password '{password}'.")

if __name__ == '__main__':
    set_admin_user()
