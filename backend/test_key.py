
import os
import django
from django.conf import settings
import google.generativeai as genai

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_gen():
    if not settings.GEMINI_API_KEY:
        print("No API Key")
        return

    genai.configure(api_key=settings.GEMINI_API_KEY)
    # Using the model I updated in views.py
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    print(f"Testing key: {settings.GEMINI_API_KEY[:5]}...")
    try:
        response = model.generate_content("Write a 5 word slogan for coffee.")
        print("SUCCESS:", response.text)
    except Exception as e:
        print("FAILURE:", e)

if __name__ == '__main__':
    test_gen()
