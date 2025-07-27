import React, { useState, useEffect } from 'react';

function ContractList() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedContract, setSelectedContract] = useState(null);
  const [contractState, setContractState] = useState(null);
  const [functionName, setFunctionName] = useState('');
  const [functionArgs, setFunctionArgs] = useState('');
  const [executionResult, setExecutionResult] = useState('');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await fetch('http://localhost:3000/contracts');
      const data = await response.json();
      setContracts(data.contracts || []);
    } catch (err) {
      setError('Failed to fetch contracts');
    } finally {
      setLoading(false);
    }
  };

  const selectContract = async (address) => {
    setSelectedContract(address);
    setExecutionResult('');
    
    try {
      const response = await fetch(`http://localhost:3000/contracts/${address}`);
      const data = await response.json();
      setContractState(data);
    } catch (err) {
      setError('Failed to fetch contract state');
    }
  };

  const executeFunction = async () => {
    if (!selectedContract || !functionName) {
      setError('Please select a contract and enter a function name');
      return;
    }

    try {
      const args = functionArgs ? functionArgs.split(',').map(arg => arg.trim()) : [];
      
      const response = await fetch(`http://localhost:3000/contracts/${selectedContract}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          function: functionName,
          args: args,
          sender: '0x123456789abcdef'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setExecutionResult(JSON.stringify(data.result, null, 2));
        // Refresh contract state
        selectContract(selectedContract);
      } else {
        setError(data.error || 'Function execution failed');
      }
    } catch (err) {
      setError('Failed to execute function');
    }
  };

  if (loading) return <div>Loading contracts...</div>;

  return (
    <div className="contract-list">
      <h3>📋 Smart Contracts</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <button onClick={fetchContracts} className="refresh-button">
        🔄 Refresh Contracts
      </button>

      {contracts.length === 0 ? (
        <p>No contracts deployed yet.</p>
      ) : (
        <div className="contracts-grid">
          <div className="contracts-sidebar">
            <h4>Deployed Contracts:</h4>
            <ul className="contract-list-items">
              {contracts.map((contract) => (
                <li 
                  key={contract.address}
                  className={selectedContract === contract.address ? 'selected' : ''}
                  onClick={() => selectContract(contract.address)}
                >
                  <div className="contract-item">
                    <strong>Address:</strong> {contract.address.substring(0, 16)}...
                    <br />
                    <strong>Owner:</strong> {contract.owner}
                    <br />
                    <strong>Balance:</strong> {contract.balance}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {selectedContract && (
            <div className="contract-details">
              <h4>Contract: {selectedContract.substring(0, 16)}...</h4>
              
              {contractState && (
                <div className="contract-state">
                  <h5>Current State:</h5>
                  <pre>{JSON.stringify(contractState, null, 2)}</pre>
                </div>
              )}

              <div className="function-executor">
                <h5>Execute Function:</h5>
                <div className="function-inputs">
                  <input
                    type="text"
                    placeholder="Function name (e.g., increment, get_count)"
                    value={functionName}
                    onChange={(e) => setFunctionName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Arguments (comma-separated)"
                    value={functionArgs}
                    onChange={(e) => setFunctionArgs(e.target.value)}
                  />
                  <button onClick={executeFunction}>🚀 Execute</button>
                </div>
              </div>

              {executionResult && (
                <div className="execution-result">
                  <h5>Result:</h5>
                  <pre>{executionResult}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ContractList;
