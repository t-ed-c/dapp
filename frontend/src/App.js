import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [blockchainInfo, setBlockchainInfo] = useState(null);
  const [blockchain, setBlockchain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fetch basic blockchain info
    fetch('http://localhost:3000/')
      .then(response => response.json())
      .then(data => {
        setBlockchainInfo(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching blockchain info:', error);
        setError('Failed to connect to blockchain API');
        setLoading(false);
      });
      
    // Fetch full blockchain data
    fetch('http://localhost:3000/blockchain')
      .then(response => response.json())
      .then(data => setBlockchain(data))
      .catch(error => console.error('Error fetching blockchain:', error));
  }, []);
  
  const refreshBlockchain = () => {
    setLoading(true);
    fetch('http://localhost:3000/blockchain')
      .then(response => response.json())
      .then(data => {
        setBlockchain(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error refreshing blockchain:', error);
        setLoading(false);
      });
  };
  
  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <h2>Loading Blockchain DApp...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="App">
        <div className="error">
          <h2>❌ Connection Error</h2>
          <p>{error}</p>
          <p>Make sure your Flask backend is running on http://localhost:3000</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>🔗 Blockchain DApp</h1>
        <p>Decentralized Application Frontend</p>
      </header>
      
      <main className="App-main">
        {blockchainInfo && (
          <section className="info-section">
            <h2>📊 Blockchain Status</h2>
            <div className="info-grid">
              <div className="info-card">
                <h3>Name</h3>
                <p>{blockchainInfo.name}</p>
              </div>
              <div className="info-card">
                <h3>Version</h3>
                <p>{blockchainInfo.version}</p>
              </div>
              <div className="info-card">
                <h3>Status</h3>
                <p className={`status ${blockchainInfo.status}`}>
                  {blockchainInfo.status}
                </p>
              </div>
              <div className="info-card">
                <h3>Block Height</h3>
                <p>{blockchainInfo.block_height}</p>
              </div>
            </div>
          </section>
        )}
        
        {blockchain && (
          <section className="blockchain-section">
            <div className="section-header">
              <h2>⛓️ Blockchain Explorer</h2>
              <button onClick={refreshBlockchain} className="refresh-btn">
                🔄 Refresh
              </button>
            </div>
            
            <div className="blockchain-info">
              <p><strong>Difficulty:</strong> {blockchain.difficulty}</p>
              <p><strong>Chain Length:</strong> {blockchain.chain_length}</p>
              <p><strong>Pending Transactions:</strong> {blockchain.pending_transactions?.length || 0}</p>
            </div>
            
            <div className="blocks-container">
              <h3>📦 Blocks</h3>
              {blockchain.chain?.map((block, index) => (
                <div key={block.index} className="block-card">
                  <div className="block-header">
                    <h4>Block #{block.index}</h4>
                    <span className="block-hash">{block.hash?.substring(0, 16)}...</span>
                  </div>
                  <div className="block-details">
                    <p><strong>Timestamp:</strong> {new Date(block.timestamp * 1000).toLocaleString()}</p>
                    <p><strong>Previous Hash:</strong> {block.previous_hash?.substring(0, 32)}...</p>
                    <p><strong>Nonce:</strong> {block.nonce}</p>
                    <div className="transactions">
                      <strong>Transactions:</strong>
                      <ul>
                        {Array.isArray(block.transactions) ? 
                          block.transactions.map((tx, txIndex) => (
                            <li key={txIndex}>{tx}</li>
                          )) : 
                          <li>{block.transactions}</li>
                        }
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      
      <footer className="App-footer">
        <p>🚀 Blockchain DApp - Built with React & Flask</p>
      </footer>
    </div>
  );
}

export default App;
