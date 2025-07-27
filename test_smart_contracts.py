import requests
import json

# Test the enhanced Flask API with smart contracts
API_BASE = "http://localhost:3000"

def test_api():
    print("🚀 Testing Enhanced PyChain DApp API")
    print("=" * 50)
    
    # Test basic API status
    print("\n1. Testing API Status...")
    response = requests.get(f"{API_BASE}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    # Test blockchain endpoint
    print("\n2. Testing Blockchain Endpoint...")
    response = requests.get(f"{API_BASE}/blockchain")
    blockchain_data = response.json()
    print(f"Status: {response.status_code}")
    print(f"Chain Length: {blockchain_data.get('chain_length', 'N/A')}")
    print(f"Difficulty: {blockchain_data.get('difficulty', 'N/A')}")
    
    # Test smart contract deployment
    print("\n3. Testing Smart Contract Deployment...")
    contract_code = """
def increment():
    if 'counter' not in storage:
        storage['counter'] = 0
    storage['counter'] += 1
    return storage['counter']

def get_count():
    return storage.get('counter', 0)

def set_count(value):
    storage['counter'] = int(value)
    return storage['counter']
"""
    
    deploy_payload = {
        "code": contract_code,
        "sender": "0x123456789abcdef"
    }
    
    response = requests.post(f"{API_BASE}/contracts", json=deploy_payload)
    print(f"Deploy Status: {response.status_code}")
    deploy_result = response.json()
    print(f"Deploy Response: {json.dumps(deploy_result, indent=2)}")
    
    if response.status_code == 201:
        contract_address = deploy_result["address"]
        print(f"✅ Contract deployed at: {contract_address}")
        
        # Test contract execution
        print("\n4. Testing Contract Execution...")
        
        # Call increment function
        call_payload = {
            "function": "increment",
            "sender": "0x123456789abcdef"
        }
        
        response = requests.post(f"{API_BASE}/contracts/{contract_address}/call", json=call_payload)
        print(f"Increment Status: {response.status_code}")
        print(f"Increment Result: {json.dumps(response.json(), indent=2)}")
        
        # Call get_count function
        call_payload = {
            "function": "get_count",
            "sender": "0x123456789abcdef"
        }
        
        response = requests.post(f"{API_BASE}/contracts/{contract_address}/call", json=call_payload)
        print(f"Get Count Status: {response.status_code}")
        print(f"Get Count Result: {json.dumps(response.json(), indent=2)}")
        
        # Get contract state
        print("\n5. Testing Contract State...")
        response = requests.get(f"{API_BASE}/contracts/{contract_address}")
        print(f"State Status: {response.status_code}")
        print(f"Contract State: {json.dumps(response.json(), indent=2)}")
        
        # List all contracts
        print("\n6. Testing Contract Listing...")
        response = requests.get(f"{API_BASE}/contracts")
        print(f"List Status: {response.status_code}")
        print(f"All Contracts: {json.dumps(response.json(), indent=2)}")
    
    print("\n🎉 API Testing Complete!")

if __name__ == "__main__":
    try:
        test_api()
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to Flask API. Make sure it's running on http://localhost:3000")
    except Exception as e:
        print(f"❌ Error during testing: {e}")
