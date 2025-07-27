import React, { useState } from 'react';

function ContractDeployer({ onDeploy }) {
  const [code, setCode] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState('');

  const sampleContracts = {
    counter: `def increment():
    if 'counter' not in storage:
        storage['counter'] = 0
    storage['counter'] += 1
    return storage['counter']

def get_count():
    return storage.get('counter', 0)

def set_count(value):
    storage['counter'] = int(value)
    return storage['counter']`,
    
    bank: `def deposit():
    if 'balance' not in storage:
        storage['balance'] = 0
    storage['balance'] += msg['value']
    return storage['balance']

def withdraw(amount):
    balance = storage.get('balance', 0)
    if balance >= amount:
        storage['balance'] = balance - amount
        return storage['balance']
    else:
        return "Insufficient funds"

def get_balance():
    return storage.get('balance', 0)`,
    
    voting: `def vote(candidate):
    if 'votes' not in storage:
        storage['votes'] = {}
    
    candidate = str(candidate)
    if candidate in storage['votes']:
        storage['votes'][candidate] += 1
    else:
        storage['votes'][candidate] = 1
    
    return storage['votes'][candidate]

def get_votes(candidate):
    return storage.get('votes', {}).get(str(candidate), 0)

def get_all_votes():
    return storage.get('votes', {})`
  };

  const handleDeploy = async () => {
    if (!code.trim()) {
      setError('Please enter contract code');
      return;
    }

    setIsDeploying(true);
    setError('');

    try {
      await onDeploy(code);
      setCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeploying(false);
    }
  };

  const loadSample = (sampleCode) => {
    setCode(sampleCode);
    setError('');
  };

  return (
    <div className="contract-deployer">
      <h3>📝 Deploy Smart Contract</h3>
      
      <div className="sample-contracts">
        <h4>Sample Contracts:</h4>
        <div className="sample-buttons">
          <button onClick={() => loadSample(sampleContracts.counter)}>
            Counter Contract
          </button>
          <button onClick={() => loadSample(sampleContracts.bank)}>
            Bank Contract
          </button>
          <button onClick={() => loadSample(sampleContracts.voting)}>
            Voting Contract
          </button>
        </div>
      </div>

      <div className="code-editor">
        <h4>Contract Code (Python):</h4>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your Python smart contract code here..."
          rows={15}
          cols={60}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button 
        onClick={handleDeploy} 
        disabled={isDeploying || !code.trim()}
        className="deploy-button"
      >
        {isDeploying ? '🔄 Deploying...' : '🚀 Deploy Contract'}
      </button>

      <div className="deployment-info">
        <h4>ℹ️ Contract Guidelines:</h4>
        <ul>
          <li>Use <code>storage</code> dictionary to store persistent data</li>
          <li>Access transaction info via <code>msg['sender']</code> and <code>msg['value']</code></li>
          <li>Define functions that can be called externally</li>
          <li>Return values from functions for output</li>
        </ul>
      </div>
    </div>
  );
}

export default ContractDeployer;
