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
  const [web3, setWeb3] = useState(null);

  // Backend API configuration
  const API_BASE_URL = 'http://localhost:5001';

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  const connect = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect your MetaMask wallet.');
      }

      const account = accounts[0];
      setAccount(account);

      // Get balance
      const balanceWei = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest'],
      });

      // Convert from Wei to ETH
      const balanceEth = parseInt(balanceWei, 16) / Math.pow(10, 18);
      setBalance(balanceEth.toFixed(4));

      // Setup Web3 provider
      setWeb3(window.ethereum);

      // Load initial data
      await fetchBlockchain();
      await fetchContracts();

      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
    } catch (err) {
      setError("Wallet connection failed: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected
      setAccount(null);
      setBalance('0');
    } else {
      // User switched accounts
      setAccount(accounts[0]);
      // Fetch new balance
      fetchBalance(accounts[0]);
    }
  };

  const handleChainChanged = (chainId) => {
    // Reload the page when chain changes
    window.location.reload();
  };

  const fetchBalance = async (accountAddress) => {
    try {
      const balanceWei = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accountAddress, 'latest'],
      });
      const balanceEth = parseInt(balanceWei, 16) / Math.pow(10, 18);
      setBalance(balanceEth.toFixed(4));
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setBalance('0');
    setWeb3(null);
    
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };

  // Check if already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled()) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            await fetchBalance(accounts[0]);
            setWeb3(window.ethereum);
            await fetchBlockchain();
            await fetchContracts();
          }
        } catch (err) {
          console.error('Error checking connection:', err);
        }
      }
    };
    
    checkConnection();
  }, []);

  const fetchBlockchain = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blockchain`);
      if (!response.ok) {
        // If backend is not available, use mock data
        setBlockchain({
          chain: [
            {
              index: 0,
              hash: '0000000000000000000000000000000000000000000000000000000000000000',
              transactions: ['Genesis Block'],
              timestamp: Date.now()
            }
          ],
          difficulty: 2,
          pending_transactions: []
        });
        return;
      }
      const data = await response.json();
      setBlockchain(data);
    } catch (err) {
      console.warn("Backend not available, using mock data");
      // Use mock data when backend is not available
      setBlockchain({
        chain: [
          {
            index: 0,
            hash: '0000000000000000000000000000000000000000000000000000000000000000',
            transactions: ['Genesis Block'],
            timestamp: Date.now()
          }
        ],
        difficulty: 2,
        pending_transactions: []
      });
    }
  };

  const fetchContracts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts`);
      if (!response.ok) {
        // If backend is not available, use empty contracts
        setContracts([]);
        return;
      }
      const data = await response.json();
      
      // Use contracts directly from the API response - they now include code
      const contractsWithDetails = (data.contracts || []).map((contract) => ({
        address: contract.address,
        owner: contract.owner,
        balance: contract.balance,
        code: contract.code || 'def hello():\n    return "Hello, World!"',
        storage: {}
      }));
      
      setContracts(contractsWithDetails);
    } catch (err) {
      console.warn("Backend not available, using empty contracts");
      setContracts([]);
    }
  };

  const deployContract = async (code) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/contracts`, {
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
      const response = await fetch(`${API_BASE_URL}/contracts/${address}/call`, {
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
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction: transactionData
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add transaction');
      }
      
      const data = await response.json();
      
      // Refresh blockchain data to show the new pending transaction
      await fetchBlockchain();
      
      return data;
    } catch (err) {
      setError("Failed to add transaction: " + err.message);
      console.error(err);
      throw err;
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
    web3,
    connect,
    disconnect,
    deployContract,
    executeContract,
    addTransaction,
    fetchBlockchain,
    fetchContracts,
    isMetaMaskInstalled
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

export default BlockchainContext;
