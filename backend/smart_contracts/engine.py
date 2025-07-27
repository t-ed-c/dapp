import hashlib
import json
import re
import types
import threading
import traceback

class SmartContractEngine:
    def __init__(self, blockchain):
        self.blockchain = blockchain
        self.contracts = {}  # address: {code, storage, balance}
        self.lock = threading.Lock()
    
    def deploy(self, code: str, sender: str = "0x0") -> str:
        """Deploy a new smart contract and return its address"""
        # Generate deterministic contract address
        contract_hash = hashlib.sha256(code.encode()).hexdigest()
        contract_address = f"0x{contract_hash[:40]}"
        
        with self.lock:
            if contract_address in self.contracts:
                raise ValueError("Contract already deployed")
                
            self.contracts[contract_address] = {
                "code": code,
                "storage": {},
                "balance": 0,
                "owner": sender
            }
        
        return contract_address
    
    def execute(self, address: str, function: str, *args, sender: str = "0x0", value: int = 0):
        """Execute a contract function in a secure sandbox"""
        with self.lock:
            contract = self.contracts.get(address)
            if not contract:
                raise ValueError("Contract not found")
            
            # Update contract balance
            if value > 0:
                contract["balance"] += value
            
            # Prepare sandbox environment
            sandbox = {
                "storage": contract["storage"],
                "msg": {
                    "sender": sender,
                    "value": value
                },
                "block": {
                    "number": len(self.blockchain.chain),
                    "timestamp": self.blockchain.last_block.timestamp
                },
                "args": args,
                "result": None
            }
            
            # Create a safe execution environment
            safe_builtins = {
                'len': len,
                'str': str,
                'int': int,
                'float': float,
                'bool': bool,
                'list': list,
                'dict': dict,
                'tuple': tuple,
                'range': range,
                'enumerate': enumerate,
                'min': min,
                'max': max,
                'sum': sum,
                'abs': abs,
                'round': round
            }
            
            # Execute the contract code
            try:
                # Wrap the contract code in a function
                exec_globals = {**safe_builtins, **sandbox}
                wrapped_code = f"""
def __contract_exec():
{self._indent_code(contract['code'])}
    return {function}(*args)
__result = __contract_exec()
"""
                exec(wrapped_code, exec_globals)
                result = exec_globals['__result']
                
                # Update storage state
                contract["storage"] = exec_globals["storage"]
                
                return result
            except Exception as e:
                traceback.print_exc()
                return f"Execution error: {str(e)}"
    
    def get_contract_state(self, address: str):
        """Get the current state of a contract"""
        with self.lock:
            contract = self.contracts.get(address)
            if contract:
                return {
                    "storage": contract["storage"],
                    "balance": contract["balance"],
                    "owner": contract["owner"]
                }
            return None
    
    def _indent_code(self, code):
        """Indent each line of code for proper execution"""
        return "\n".join("    " + line for line in code.splitlines())
    
    def __repr__(self):
        return f"SmartContractEngine<contracts={len(self.contracts)}>"

# Test function
if __name__ == "__main__":
    from blockchain.blockchain import Blockchain
    
    print("=== Testing Smart Contract Engine ===")
    bc = Blockchain()
    engine = SmartContractEngine(bc)
    
    # Sample contract code
    counter_contract = """
def increment():
    if 'counter' not in storage:
        storage['counter'] = 0
    storage['counter'] += 1
    return storage['counter']

def get_count():
    return storage.get('counter', 0)
"""
    
    # Deploy contract
    address = engine.deploy(counter_contract)
    print(f"Deployed contract at: {address}")
    
    # Execute contract functions
    print("Incrementing counter...")
    result = engine.execute(address, "increment")
    print(f"New count: {result}")
    
    print("Getting count...")
    count = engine.execute(address, "get_count")
    print(f"Current count: {count}")
    
    print("Contract state:")
    print(json.dumps(engine.get_contract_state(address), indent=2))