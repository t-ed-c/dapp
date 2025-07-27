import React, { useState } from 'react';

const ContractDeployer = ({ onDeploy }) => {
  const [code, setCode] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState(null);
  
  const sampleContract = `def increment():
    if 'counter' not in storage:
        storage['counter'] = 0
    storage['counter'] += 1
    return storage['counter']

def get_count():
    return storage.get('counter', 0)`;

  const handleDeploy = async () => {
    if (!code.trim()) {
      setError('Contract code is required');
      return;
    }
    
    setError(null);
    setIsDeploying(true);
    
    try {
      await onDeploy(code);
      setCode('');
    } catch (err) {
      setError(err.message || 'Failed to deploy contract');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="contract-deployer">
      <h2>Deploy Smart Contract</h2>
      
      <div className="toolbar">
        <button onClick={() => setCode(sampleContract)}>
          Load Sample Contract
        </button>
        <button onClick={() => setCode('')}>
          Clear Code
        </button>
      </div>
      
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Write your Python smart contract here..."
        rows={12}
      />
      
      {error && <div className="error">{error}</div>}
      
      <button 
        onClick={handleDeploy} 
        disabled={isDeploying}
        className="deploy-button"
      >
        {isDeploying ? 'Deploying...' : 'Deploy Contract'}
      </button>
    </div>
  );
};

export default ContractDeployer;