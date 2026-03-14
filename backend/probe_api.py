import requests
import sys

try:
    # 1. Login
    resp = requests.post('http://127.0.0.1:8000/api/token/', data={'username': 'admin', 'password': 'admin123'})
    if resp.status_code != 200:
        print("LOGIN FAILED")
        print(resp.text)
        sys.exit(1)
    
    token = resp.json()['access']
    
    # 2. Hit Endpoint
    headers = {'Authorization': f'Bearer {token}'}
    r = requests.get('http://127.0.0.1:8000/api/sales/insights/', headers=headers)
    
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("SUCCESS: API is working.")
        print(r.json())
    else:
        print("FAILURE: API returned error.")
        print(r.text)

except Exception as e:
    print(f"EXCEPTION: {e}")
