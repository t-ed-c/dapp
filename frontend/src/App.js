import React, { useState, useEffect } from 'react';
import ContractDeployer from './ContractDeployer.js';
import ContractList from './ContractList.js';
import './App.css';

function App() {
  const [blockchainInfo, setBlockchainInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchBlockchainInfo = async () => {
      try {
        const response = await fetch('http://localhost:3000/');
        const data = await response.json();
        setBlockchainInfo(data);
      } catch (err) {
        setError('Failed to fetch blockchain data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlockchainInfo();
  }, []);
  
  const handleDeploy = async (code) => {
    try {
      const response = await fetch('http://localhost:3000/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Deployment failed');
      }
      
      alert(`Contract deployed at: ${data.address}`);
      return data.address;
    } catch (err) {
      throw new Error(err.message || 'Contract deployment failed');
    }
  };
  
  return (
    <div className="App">
      <header>
        <h1>PyChain DApp</h1>
        <p>Python-Powered Decentralized Application</p>
      </header>
      
      <main>
        {error && <div className="error">{error}</div>}
        
        <section className="blockchain-status">
          <h2>Blockchain Status</h2>
          {loading ? (
            <p>Loading blockchain data...</p>
          ) : blockchainInfo ? (
            <div className="status-cards">
              <div className="card">
                <h3>Blocks</h3>
                <p>{blockchainInfo.block_height}</p>
              </div>
              <div className="card">
                <h3>Contracts</h3>
                <p>{blockchainInfo.contracts}</p>
              </div>
              <div className="card">
                <h3>Status</h3>
                <p>{blockchainInfo.status}</p>
              </div>
            </div>
          ) : (
            <p>No blockchain data available</p>
          )}
        </section>
        
        <section className="contract-section">
          <ContractDeployer onDeploy={handleDeploy} />
          <ContractList />
        </section>
      </main>
      
      <footer>
        <p>Day 2: Smart Contract Implementation</p>
      </footer>
    </div>
  );
}

export default App;
