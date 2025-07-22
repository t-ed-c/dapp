import React, { useState, useEffect } from 'react';

function App() {
  const [blockchainInfo, setBlockchainInfo] = useState(null);
  
  useEffect(() => {
    fetch('http://localhost:3000/')
      .then(response => response.json())
      .then(data => setBlockchainInfo(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);
  
  return (
    <div className="App">
      <header>
        <h1>Blockchain DApp</h1>
        <p>Building a decentralized application</p>
      </header>
      
      <main>
        {blockchainInfo ? (
          <div className="blockchain-info">
            <h2>Blockchain Status</h2>
            <p><strong>Name:</strong> {blockchainInfo.name}</p>
            <p><strong>Version:</strong> {blockchainInfo.version}</p>
            <p><strong>Status:</strong> {blockchainInfo.status}</p>
            <p><strong>Block Height:</strong> {blockchainInfo.block_height}</p>
          </div>
        ) : (
          <p>Loading blockchain data...</p>
        )}
      </main>
      
      <footer>
        <p>Day 1: Core Infrastructure Setup</p>
      </footer>
    </div>
  );
}
function App() {
  const [blockchainInfo, setBlockchainInfo] = useState(null);
  const [error, setError] = useState(null);  // Add error state
  
  useEffect(() => {
    fetch('http://localhost:3000/')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setBlockchainInfo(data);
        setError(null);  // Clear any previous errors
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError(error.message);  // Set error message
      });
  }, []);
  
  return (
    <div className="App">
      <header>
        <h1>Blockchain DApp</h1>
        <p>Building a decentralized application</p>
      </header>
      
      <main>
        {error ? (  // Show error if exists
          <div className="error">
            <h2>Connection Error</h2>
            <p>{error}</p>
            <p>Please ensure the backend is running at http://localhost:3000</p>
          </div>
        ) : blockchainInfo ? (
          <div className="blockchain-info">
            <h2>Blockchain Status</h2>
            <p><strong>Name:</strong> {blockchainInfo.name}</p>
            <p><strong>Version:</strong> {blockchainInfo.version}</p>
            <p><strong>Status:</strong> {blockchainInfo.status}</p>
            <p><strong>Block Height:</strong> {blockchainInfo.block_height}</p>
          </div>
        ) : (
          <p>Loading blockchain data...</p>
        )}
      </main>
      
      <footer>
        <p>Day 1: Core Infrastructure Setup</p>
      </footer>
    </div>
  );
}
export default App;