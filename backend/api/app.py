from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
import sys
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

try:
    from blockchain.src.blockchain import Blockchain
    from blockchain.src.p2p_network import Node
    from smart_contracts.engine import SmartContractEngine
    print("✅ Successfully imported all modules")
except ImportError as e:
    print(f"❌ Error importing modules: {e}")
    print(f"Backend dir: {backend_dir}")
    print(f"Python path: {sys.path}")
    raise

bc = Blockchain(difficulty=2)
contract_engine = SmartContractEngine(bc)

# Run node in background only once
node = None
node_started = False

def run_node():
    global node, node_started
    if not node_started:
        node = Node('127.0.0.1', 5000, bc)
        node.start()
        node_started = True
        print(f"🖥️  Node started at 127.0.0.1:5000")

# Start node only if we're not in the Flask reloader thread
if not os.environ.get("WERKZEUG_RUN_MAIN") == "true":
    threading.Thread(target=run_node, daemon=True).start()

@app.route('/')
def index():
    return jsonify({
        "name": "PyChain DApp API",
        "version": "1.0",
        "status": "running",
        "block_height": len(bc.chain),
        "contracts": len(contract_engine.contracts)
    })

@app.route('/api')
def api_index():
    return jsonify({
        "name": "PyChain DApp API",
        "version": "1.0",
        "status": "running",
        "block_height": len(bc.chain),
        "contracts": len(contract_engine.contracts)
    })

@app.route('/blockchain', methods=['GET'])
def get_blockchain():
    return jsonify(bc.to_dict())

@app.route('/api/blockchain', methods=['GET'])
def api_get_blockchain():
    return jsonify(bc.to_dict())

@app.route('/contracts', methods=['POST'])
def deploy_contract():
    data = request.json
    if not data or 'code' not in data:
        return jsonify({"error": "Missing contract code"}), 400
    
    sender = data.get('sender', '0x0')
    
    try:
        address = contract_engine.deploy(data['code'], sender)
        return jsonify({
            "address": address,
            "message": "Contract deployed successfully"
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/contracts/<address>/call', methods=['POST'])
def call_contract(address):
    data = request.json
    if not data or 'function' not in data:
        return jsonify({"error": "Missing function name"}), 400
    
    function = data['function']
    args = data.get('args', [])
    sender = data.get('sender', '0x0')
    value = data.get('value', 0)
    
    try:
        result = contract_engine.execute(address, function, *args, sender=sender, value=value)
        return jsonify({
            "address": address,
            "function": function,
            "result": result
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/contracts/<address>', methods=['GET'])
def get_contract(address):
    state = contract_engine.get_contract_state(address)
    if state is None:
        return jsonify({"error": "Contract not found"}), 404
    
    return jsonify(state), 200

@app.route('/contracts', methods=['GET'])
def list_contracts():
    contracts = []
    for address, details in contract_engine.contracts.items():
        contracts.append({
            "address": address,
            "owner": details["owner"],
            "balance": details["balance"],
            "code": details["code"]
        })
    
    return jsonify({"contracts": contracts}), 200

@app.route('/transactions', methods=['POST'])
def create_transaction():
    data = request.json
    if 'transaction' not in data:
        return jsonify({"error": "Transaction data missing"}), 400
    
    # Add transaction to blockchain
    bc.add_transaction(data['transaction'])
    return jsonify({
        "status": "success", 
        "message": "Transaction added to pending pool",
        "block": len(bc.chain)  # Will be included in next block
    }), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True, use_reloader=False)