from flask import Flask, jsonify
import threading
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from blockchain.src.blockchain import Blockchain
from smart_contracts.engine import SmartContractEngine

app = Flask(__name__)
bc = Blockchain(difficulty=2)
contract_engine = SmartContractEngine(bc)

# Run node in background
node = None

def run_node():
    global node
    from blockchain.src.p2p_network import Node
    node = Node('0.0.0.0', 5000, bc)
    node.start()

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

@app.route('/blockchain', methods=['GET'])
def get_blockchain():
    return jsonify(bc.to_dict())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)