import React, { useState, useEffect } from 'react';
import ContractInteractor from './ContractInteractor';

const ContractList = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch('http://localhost:3000/contracts');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load contracts');
        }
        
        setContracts(data.contracts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContracts();
  }, []);
  
  if (loading) {
    return <div>Loading contracts...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  if (contracts.length === 0) {
    return <div>No contracts deployed yet</div>;
  }
  
  return (
    <div className="contract-list">
      <h2>Deployed Contracts</h2>
      {contracts.map((contract) => (
        <div key={contract.address} className="contract-item">
          <ContractInteractor contract={contract} />
        </div>
      ))}
    </div>
  );
};

export default ContractList;