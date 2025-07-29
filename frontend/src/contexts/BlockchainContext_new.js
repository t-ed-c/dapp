import React, { createContext, useState, useEffect, useContext } from 'react';

const BlockchainContext = createContext();

export const useBlockchain = () => useContext(BlockchainContext);

export const BlockchainProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [blockchain, setBlockchain] = useState({ chain: [], difficulty: 2, pending_transactions: [] });
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const connect = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate wallet connection
      const mockAccount = '0x' + Math.random().toString(16).substr(2, 40);
      const mockBalance = (Math.random() * 10).toFixed(2);
      
      setAccount(mockAccount);
      setBalance(mockBalance);
      
      // Load initial data
      await fetchBlockchain();
      await fetchContracts();
      
    } catch (err) {
      setError("Wallet connection failed: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockchain = async () => {
    try {
      const response = await fetch('http://localhost:3000/blockchain');
      if (!response.ok) {
        throw new Error('Failed to fetch blockchain data');
      }
      const data = await response.json();
      setBlockchain(data);
    } catch (err) {
      setError("Failed to fetch blockchain data: " + err.message);
      console.error(err);
    }
  };

  const fetchContracts = async () => {
    try {
      const response = await fetch('http://localhost:3000/contracts');
      if (!response.ok) {
        throw new Error('Failed to fetch contracts');
      }
      const data = await response.json();
      
      // Get detailed contract information
      const contractsWithDetails = await Promise.all(
        (data.contracts || []).map(async (contract) => {
          try {
            const detailResponse = await fetch(`http://localhost:3000/contracts/${contract.address}`);
            if (detailResponse.ok) {
              const details = await detailResponse.json();
              return {
                ...contract,
                code: 'Contract code available',
                storage: details.storage || {}
              };
            }
          } catch (error) {
            console.error('Error fetching contract details:', error);
          }
          return {
            ...contract,
            code: 'def hello():\n    return "Hello, World!"',
            storage: {}
          };
        })
      );
      
      setContracts(contractsWithDetails);
    } catch (err) {
      setError("Failed to fetch contracts: " + err.message);
      console.error(err);
    }
  };

  const deployContract = async (code) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code, 
          sender: account || '0x0'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to deploy contract');
      }
      
      const data = await response.json();
      
      // Add new contract to the list
      const newContract = {
        address: data.address,
        owner: account || '0x0',
        balance: 0,
        code: code,
        storage: {}
      };
      
      setContracts(prev => [...prev, newContract]);
      
      // Refresh blockchain data
      await fetchBlockchain();
      
      return data.address;
    } catch (err) {
      setError("Failed to deploy contract: " + err.message);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const executeContract = async (address, functionName, args = []) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/contracts/${address}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          function: functionName,
          args: args,
          sender: account || '0x0'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to execute contract');
      }
      
      const data = await response.json();
      
      // Refresh contracts to get updated state
      await fetchContracts();
      
      return data.result;
    } catch (err) {
      setError("Failed to execute contract: " + err.message);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transactionData) => {
    setLoading(true);
    setError(null);
    try {
      // For now, just refresh blockchain data
      // In a real implementation, you'd have an endpoint to add transactions
      await fetchBlockchain();
    } catch (err) {
      setError("Failed to add transaction: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data on component mount
  useEffect(() => {
    fetchBlockchain();
    fetchContracts();
  }, []);

  const value = {
    account,
    balance,
    blockchain,
    contracts,
    loading,
    error,
    connect,
    deployContract,
    executeContract,
    addTransaction,
    fetchBlockchain,
    fetchContracts
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

export default BlockchainContext;
