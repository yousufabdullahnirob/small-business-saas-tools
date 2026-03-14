import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

users = User.objects.all()
print(f"Total Users: {len(users)}")
for user in users:
    print(f"Username: {user.username}, Is Superuser: {user.is_superuser}, Is Active: {user.is_active}")

# Ensure 'fixuser' is active and has correct password
if User.objects.filter(username='fixuser').exists():
    user = User.objects.get(username='fixuser')
    user.is_active = True
    user.set_password('password123')
    user.save()
    print("User 'fixuser' is now active and password reset to 'password123'")
else:
    User.objects.create_superuser('fixuser', 'fixuser@example.com', 'password123')
    print("Superuser 'fixuser' created and is active with password 'password123'")
