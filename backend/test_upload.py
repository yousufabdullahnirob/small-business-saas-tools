
import os
import sys
import django

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS.append('testserver')

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from inventory.models import Product
from django.contrib.auth.models import User

def test_upload():
    # Setup
    print("Setting up test...")
    user, _ = User.objects.get_or_create(username='test_uploader_3', email='up3@test.com')
    product = Product.objects.create(name='Upload Test Product 3', price=100, stock_quantity=10, user=user)
    
    client = APIClient()
    client.force_authenticate(user=user)
    
    # Create fake image
    image_content = b'fake_image_content_3'
    image = SimpleUploadedFile("test_image_3.jpg", image_content, content_type="image/jpeg")
    
    print("Executing PATCH request...")
    response = client.patch(
        f'/api/inventory/products/{product.id}/', 
        {'image': image}, 
        format='multipart'
    )
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        product.refresh_from_db()
        print(f"Image Field: {product.image}")
        if product.image:
            print("SUCCESS: Image uploaded")
        else:
            print("FAILURE: Image field empty")
    else:
        print("FAILURE: API Error")
        print(response.data)

if __name__ == '__main__':
    test_upload()
