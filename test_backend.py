import requests
import json

print("Testing Flask Backend...")

try:
    # Test main endpoint
    response = requests.get('http://localhost:3000/')
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Test blockchain endpoint
    response2 = requests.get('http://localhost:3000/blockchain')
    print(f"Blockchain Status Code: {response2.status_code}")
    print(f"Blockchain Response: {response2.json()}")
    
    print("✅ Backend is working correctly!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("Make sure your Flask backend is running on port 3000")
