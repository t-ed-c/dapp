import React from 'react';
import { 
  ChakraProvider, 
  defaultSystem 
} from '@chakra-ui/react';
import { BlockchainProvider, useBlockchain } from './contexts/BlockchainContext';

const AppContent = () => {
  const {
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
    isMetaMaskInstalled
  } = useBlockchain();

  const [contractCode, setContractCode] = React.useState(`def hello():\n    return "Hello, World!"`);
  const [newTransaction, setNewTransaction] = React.useState('');

  const handleDeploy = async () => {
    if (contractCode.trim()) {
      try {
        await deployContract(contractCode);
        setContractCode('');
      } catch (err) {
        console.error('Deploy error:', err);
      }
    }
  };

  const handleSubmitTransaction = async () => {
    if (newTransaction.trim()) {
      try {
        await addTransaction(newTransaction);
        setNewTransaction('');
      } catch (err) {
        console.error('Transaction error:', err);
      }
    }
  };

  const loadTestContract = () => {
    setContractCode(`def hello():
    return "Hello from PyChain!"`);
  };

  if (loading && !account) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #4299e1 0%, #805ad5 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #4299e1 0%, #805ad5 100%)',
      padding: '32px'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px' 
      }}>
        <div>
          <h1 style={{ 
            fontSize: '36px', 
            color: 'white', 
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            margin: '0 0 8px 0'
          }}>
            🔗 PyChain DApp
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '18px',
            margin: '0 0 8px 0'
          }}>
            Python-Powered Decentralized Application
          </p>
          <p style={{ 
            color: 'rgba(255,255,255,0.7)', 
            fontSize: '14px',
            margin: '0'
          }}>
            Day 3: Full Web3 Integration with Wallet & Smart Contracts ✨
          </p>
        </div>
        
        {account ? (
          <div style={{ textAlign: 'right' }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '8px'
            }}>
              <p style={{ 
                fontSize: '14px', 
                color: 'rgba(255,255,255,0.7)', 
                margin: '0 0 4px 0' 
              }}>
                Connected Wallet
              </p>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: 'white', 
                  fontSize: '16px' 
                }}>
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <span style={{ 
                  color: '#68d391', 
                  fontWeight: 'bold', 
                  fontSize: '16px' 
                }}>
                  💰 {balance} ETH
                </span>
              </div>
            </div>
            <button 
              onClick={disconnect}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'right' }}>
            {!isMetaMaskInstalled() && (
              <p style={{ 
                color: '#fbb6ce', 
                fontSize: '14px',
                margin: '0 0 8px 0'
              }}>
                ⚠️ MetaMask not detected
              </p>
            )}
            <button 
              onClick={connect}
              disabled={!isMetaMaskInstalled()}
              style={{
                background: '#4299e1',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: isMetaMaskInstalled() ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: 'bold',
                opacity: isMetaMaskInstalled() ? 1 : 0.6
              }}
            >
              {isMetaMaskInstalled() ? '🦊 Connect MetaMask' : '🔗 Install MetaMask'}
            </button>
            {!isMetaMaskInstalled() && (
              <button 
                onClick={() => window.open('https://metamask.io/', '_blank')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#90cdf4',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline',
                  marginTop: '8px',
                  display: 'block'
                }}
              >
                Download MetaMask
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#e53e3e',
          color: 'white',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          fontWeight: 'bold'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Main Content */}
      <div style={{ 
        display: 'flex', 
        gap: '32px',
        flexDirection: window.innerWidth < 768 ? 'column' : 'row'
      }}>
        {/* Blockchain Section */}
        <div style={{
          flex: 1,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '24px',
          padding: '32px'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            color: 'white', 
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>
            ⛓️ Blockchain Status
          </h2>
          
          {blockchain.chain?.length > 0 ? (
            <div>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <h3 style={{ 
                  color: 'white', 
                  fontSize: '18px',
                  margin: '0 0 16px 0'
                }}>
                  📊 Network Stats
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>Blocks:</span>
                    <span style={{ color: '#90cdf4', fontWeight: 'bold' }}>
                      {blockchain.chain.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>Difficulty:</span>
                    <span style={{ color: '#d6bcfa', fontWeight: 'bold' }}>
                      {blockchain.difficulty || 2}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>Pending Transactions:</span>
                    <span style={{ color: '#faf089', fontWeight: 'bold' }}>
                      {blockchain.pending_transactions?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Latest Blocks */}
              <div>
                <h3 style={{ 
                  color: 'white', 
                  fontSize: '18px',
                  margin: '0 0 16px 0'
                }}>
                  🧱 Latest Blocks
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {blockchain.chain.slice(-3).reverse().map((block, index) => (
                    <div 
                      key={block.hash || index}
                      style={{
                        background: 'rgba(255,255,255,0.12)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        padding: '16px'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <span style={{ 
                          color: '#90cdf4', 
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}>
                          🔷 Block #{block.index}
                        </span>
                        <span style={{ 
                          color: 'rgba(255,255,255,0.6)',
                          fontSize: '12px'
                        }}>
                          {block.transactions?.length || 0} txs
                        </span>
                      </div>
                      <div style={{ 
                        color: 'rgba(255,255,255,0.8)',
                        background: 'rgba(0,0,0,0.3)',
                        padding: '8px',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {block.hash}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Transaction */}
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ 
                  color: 'white', 
                  fontSize: '18px',
                  margin: '0 0 16px 0'
                }}>
                  ➕ Add Transaction
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <textarea 
                    value={newTransaction}
                    onChange={(e) => setNewTransaction(e.target.value)}
                    placeholder="Enter transaction details..."
                    rows={3}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      padding: '12px',
                      resize: 'none'
                    }}
                  />
                  <button 
                    onClick={handleSubmitTransaction}
                    style={{
                      background: '#4299e1',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    🚀 Submit Transaction
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '300px'
            }}>
              <div style={{ color: 'white', fontSize: '18px' }}>
                Loading blockchain data...
              </div>
            </div>
          )}
        </div>
        
        {/* Contracts Section */}
        <div style={{
          flex: 1,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '24px',
          padding: '32px'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            color: 'white', 
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>
            📝 Smart Contracts
          </h2>
          
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ 
              color: 'white', 
              fontSize: '18px',
              margin: '0 0 16px 0'
            }}>
              🚀 Deploy New Contract
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button 
                  onClick={loadTestContract}
                  style={{
                    background: '#2d3748',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  📝 Load Test Contract
                </button>
                <button 
                  onClick={() => setContractCode('')}
                  style={{
                    background: '#2d3748',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  🗑️ Clear
                </button>
              </div>
              <textarea 
                value={contractCode}
                onChange={(e) => setContractCode(e.target.value)}
                placeholder="Enter Python contract code..."
                style={{
                  minHeight: '250px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#68d391',
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  resize: 'none'
                }}
              />
              <button 
                onClick={handleDeploy}
                style={{
                  background: '#38a169',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                ⚡ Deploy Contract
              </button>
            </div>
          </div>
          
          {contracts.length > 0 && (
            <div>
              <h3 style={{ 
                color: 'white', 
                fontSize: '18px',
                margin: '0 0 16px 0'
              }}>
                📋 Deployed Contracts ({contracts.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {contracts.map((contract, index) => (
                  <div 
                    key={contract.address || index}
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '16px',
                      padding: '24px'
                    }}
                  >
                    <p style={{ 
                      color: '#d6bcfa', 
                      fontWeight: 'bold',
                      fontSize: '12px',
                      margin: '0 0 8px 0'
                    }}>
                      📍 Contract Address
                    </p>
                    <div style={{ 
                      color: 'rgba(255,255,255,0.8)',
                      background: 'rgba(0,0,0,0.3)',
                      padding: '8px',
                      borderRadius: '6px',
                      marginBottom: '16px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {contract.address}
                    </div>
                    
                    <p style={{ 
                      color: 'white', 
                      fontWeight: 'bold',
                      margin: '0 0 12px 0'
                    }}>
                      💻 Code:
                    </p>
                    <pre style={{
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      padding: '16px',
                      fontSize: '12px',
                      color: '#68d391',
                      fontFamily: 'monospace',
                      maxHeight: '150px',
                      overflow: 'auto',
                      marginBottom: '16px'
                    }}>
                      {contract.code}
                    </pre>
                    <button 
                      onClick={() => executeContract(contract.address, 'hello')}
                      style={{
                        background: '#805ad5',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      🎯 Execute hello()
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Day 3 Features Showcase */}
      <div style={{
        marginTop: '32px',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '24px',
        padding: '24px'
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          color: 'white', 
          textAlign: 'center',
          margin: '0 0 16px 0'
        }}>
          🚀 Day 3 Features Implemented
        </h2>
        <div style={{ 
          display: 'flex', 
          gap: '24px',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          justifyContent: 'space-around'
        }}>
          <div>
            <h3 style={{ color: '#90cdf4', fontSize: '16px', margin: '0 0 8px 0' }}>
              💳 Wallet Integration
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '4px 0' }}>
              ✅ Connect/disconnect MetaMask wallet
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '4px 0' }}>
              ✅ Display account address and balance
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '4px 0' }}>
              ✅ Sign transactions
            </p>
          </div>
          
          <div>
            <h3 style={{ color: '#68d391', fontSize: '16px', margin: '0 0 8px 0' }}>
              📝 Contract Management
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '4px 0' }}>
              ✅ Deploy new smart contracts
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '4px 0' }}>
              ✅ List deployed contracts
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '4px 0' }}>
              ✅ Execute contract functions
            </p>
          </div>
          
          <div>
            <h3 style={{ color: '#d6bcfa', fontSize: '16px', margin: '0 0 8px 0' }}>
              ⛓️ Blockchain Interaction
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '4px 0' }}>
              ✅ View blockchain status
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '4px 0' }}>
              ✅ Submit new transactions
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '4px 0' }}>
              ✅ See pending transactions
            </p>
          </div>
          
          <div>
            <h3 style={{ color: '#faf089', fontSize: '16px', margin: '0 0 8px 0' }}>
              🎨 Enhanced UI
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '4px 0' }}>
              ✅ Responsive layout
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '4px 0' }}>
              ✅ Real-time blockchain updates
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '4px 0' }}>
              ✅ Error handling & notifications
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '4px 0' }}>
              ✅ Code editor for deployment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <BlockchainProvider>
        <AppContent />
      </BlockchainProvider>
    </ChakraProvider>
  );
}

export default App;
