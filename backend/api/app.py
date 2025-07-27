from flask import Flask, jsonify
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

# Run node in background
node = None

def run_node():
    global node
    try:
        # Create node on a different port to avoid conflicts
        node = Node('127.0.0.1', 5001, bc)
        node.start()
        print("✅ P2P Node started successfully at 127.0.0.1:5001")
    except Exception as e:
        print(f"❌ Error starting P2P node: {e}")
        print("The Flask API will continue running without P2P functionality")

# Start node in background thread
threading.Thread(target=run_node, daemon=True).start()

@app.route('/')
def index():
    return jsonify({
        "name": "Blockchain DApp API",
        "version": "1.0",
        "status": "running",
        "block_height": len(bc.chain)
    })

@app.route('/api')
def api_index():
    return jsonify({
        "name": "Blockchain DApp API",
        "version": "1.0",
        "status": "running",
        "block_height": len(bc.chain)
    })

@app.route('/blockchain', methods=['GET'])
def get_blockchain():
    return jsonify(bc.to_dict())

@app.route('/api/blockchain', methods=['GET'])
def api_get_blockchain():
    return jsonify(bc.to_dict())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)