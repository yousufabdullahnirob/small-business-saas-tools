import requests
import os
import sys

# Login to get token
response = requests.post('http://127.0.0.1:8000/api/token/', data={'username': 'admin', 'password': 'admin123'})
if response.status_code != 200:
    print("Login failed:", response.text)
    sys.exit(1)

token = response.json()['access']
headers = {'Authorization': f'Bearer {token}'}

# Hit the failing endpoint
print("Hitting insights endpoint...")
res = requests.get('http://127.0.0.1:8000/api/sales/insights/', headers=headers)
print(f"Status Code: {res.status_code}")
if res.status_code == 500:
    # Django returns HTML debug page for 500 if DEBUG=True. We want to extract the exception.
    # But usually the console log has the traceback.
    print("500 Error encountered. Check backend console log.")
else:
    print(res.text)
