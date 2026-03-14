
import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from django.db.models import Count, F
from django.db.models.functions import Lower

def check_duplicates():
    print("Checking for duplicate emails (case-insensitive)...")
    
    # Annotate with lower case email
    users = User.objects.annotate(email_lower=Lower('email'))
    
    # Find emails that appear more than once
    duplicates = users.values('email_lower').annotate(count=Count('id')).filter(count__gt=1)
    
    if not duplicates:
        print("No duplicate emails found.")
        return

    print(f"Found {len(duplicates)} duplicate email groups:")
    for dep in duplicates:
        email = dep['email_lower']
        count = dep['count']
        print(f" - {email}: {count} users")
        
        # List the users in this group
        dup_users = User.objects.filter(email__iexact=email)
        for user in dup_users:
            print(f"   ID: {user.id}, Username: {user.username}, Email: {user.email}, Date Joined: {user.date_joined}")

if __name__ == '__main__':
    check_duplicates()
