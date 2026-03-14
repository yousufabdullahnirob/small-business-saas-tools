
import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from inventory.models import Product
from accounts.models import BusinessProfile
import google.generativeai as genai

def test_generation():
    # 1. Setup Data
    user, _ = User.objects.get_or_create(username='test_user_gen', email='test@example.com')
    product, _ = Product.objects.get_or_create(
        user=user, 
        name='Test Shoe', 
        defaults={'price': 100, 'stock_quantity': 50}
    )
    
    # 2. Configure Gemini
    print(f"API Key present: {bool(settings.GEMINI_API_KEY)}")
    if not settings.GEMINI_API_KEY:
        print("ERROR: No API Key")
        return

    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-flash-latest')
        
        prompt = f"Write a tweet about {product.name} priced at {product.price}."
        print("Sending prompt to Gemini...")
        
        response = model.generate_content(prompt)
        print("--- Generated Content ---")
        print(response.text)
        print("-------------------------")
        print("SUCCESS")
        
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == '__main__':
    test_generation()
