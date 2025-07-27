import React, { useState } from 'react';

const ContractInteractor = ({ contract }) => {
  const [functionName, setFunctionName] = useState('');
  const [args, setArgs] = useState('');
  const [result, setResult] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);
  
  const executeFunction = async () => {
    if (!functionName) {
      setError('Function name is required');
      return;
    }
    
    setError(null);
    setIsExecuting(true);
    
    try {
      const argsArray = args.split(',').map(arg => arg.trim()).filter(arg => arg);
      
      const response = await fetch(`http://localhost:3000/contracts/${contract.address}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          function: functionName, 
          args: argsArray 
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Execution failed');
      }
      
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsExecuting(false);
    }
  };
  
  return (
    <div className="contract-interactor">
      <h3>
        Contract: 
        <span className="address">
          {contract.address.slice(0, 8)}...{contract.address.slice(-6)}
        </span>
      </h3>
      
      <div className="input-group">
        <label>Function:</label>
        <input
          type="text"
          value={functionName}
          onChange={(e) => setFunctionName(e.target.value)}
          placeholder="Enter function name"
        />
      </div>
      
      <div className="input-group">
        <label>Arguments (comma separated):</label>
        <input
          type="text"
          value={args}
          onChange={(e) => setArgs(e.target.value)}
          placeholder="arg1, arg2, ..."
        />
      </div>
      
      <button 
        onClick={executeFunction} 
        disabled={isExecuting}
        className="execute-button"
      >
        {isExecuting ? 'Executing...' : 'Execute Function'}
      </button>
      
      {error && <div className="error">{error}</div>}
      
      {result !== null && (
        <div className="result">
          <strong>Result:</strong> 
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ContractInteractor;