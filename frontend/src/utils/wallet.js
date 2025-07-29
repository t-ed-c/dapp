import { ethers } from 'ethers';

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      return {
        address: accounts[0],
        provider,
        signer
      };
    } catch (error) {
      console.error("Wallet connection failed:", error);
      return null;
    }
  } else {
    alert("Please install MetaMask!");
    return null;
  }
};

export const getWalletBalance = async (address) => {
  if (window.ethereum) {
    try {
      const balance = await window.ethereum.request({ 
        method: 'eth_getBalance', 
        params: [address, 'latest'] 
      });
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Balance check failed:", error);
      return "0";
    }
  }
  return "0";
};

export const signMessage = async (signer, message) => {
  try {
    const signature = await signer.signMessage(message);
    return signature;
  } catch (error) {
    console.error("Message signing failed:", error);
    return null;
  }
};