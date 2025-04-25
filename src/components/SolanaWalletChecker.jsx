// src/components/SolanaWalletChecker.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';

const SolanaWalletChecker = ({ isTestnet }) => {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(null);
  const [previousBalance, setPreviousBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [monitoring, setMonitoring] = useState(false);
  const [notificationThreshold, setNotificationThreshold] = useState('');
  const [notification, setNotification] = useState(null);
  
  const monitoringIntervalRef = useRef(null);

  const network = isTestnet
    ? 'https://api.testnet.solana.com'
    : 'https://solana-mainnet.g.alchemy.com/v2/gc8LPqeXM7ZGja289ivR7YoerEUSEDLF';
    
  const networkName = isTestnet ? 'Solana Testnet' : 'Solana';
  const explorer = 'https://explorer.solana.com';

  // Clear monitoring when component unmounts or network changes
  useEffect(() => {
    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, [isTestnet]);

  // Reset state when network changes
  useEffect(() => {
    setBalance(null);
    setPreviousBalance(null);
    setError('');
    setMonitoring(false);
    setNotification(null);
    
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
  }, [isTestnet]);

  const checkBalance = async () => {
    if (!address) {
      setError('Please enter a wallet address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate Solana address
      new PublicKey(address);
      
      const connection = new Connection(network);
      const publicKey = new PublicKey(address);
      const balanceLamports = await connection.getBalance(publicKey);
      
      // Convert from lamports to SOL (1 SOL = 10^9 lamports)
      const formattedBalance = (balanceLamports / 1_000_000_000).toFixed(9);
      
      if (balance !== null) {
        setPreviousBalance(balance);
      }
      
      setBalance(formattedBalance);
      
      // Check if balance is below threshold
      if (notificationThreshold && parseFloat(formattedBalance) < parseFloat(notificationThreshold)) {
        setNotification({
          type: 'warning',
          message: `Balance is below threshold of ${notificationThreshold} SOL!`
        });
      } else if (previousBalance !== null && previousBalance !== formattedBalance) {
        // If balance changed, notify
        const diff = parseFloat(formattedBalance) - parseFloat(previousBalance);
        const sign = diff > 0 ? '+' : '';
        
        setNotification({
          type: diff >= 0 ? 'info' : 'warning',
          message: `Balance changed by ${sign}${diff.toFixed(6)} SOL`
        });
      } else {
        setNotification(null);
      }
      
    } catch (err) {
      console.error('Error fetching Solana balance:', err);
      setError(`Invalid Solana address or error fetching balance: ${err.message}`);
      setMonitoring(false);
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
        monitoringIntervalRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMonitoring = () => {
    if (monitoring) {
      // Stop monitoring
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
        monitoringIntervalRef.current = null;
      }
      setMonitoring(false);
    } else {
      // Start monitoring - first check balance immediately
      checkBalance();
      // Then set up interval (every 30 seconds)
      monitoringIntervalRef.current = setInterval(checkBalance, 30000);
      setMonitoring(true);
    }
  };

  const getExplorerUrl = () => {
    const cluster = isTestnet ? '?cluster=testnet' : '';
    return `${explorer}/address/${address}${cluster}`;
  };

  return (
    <div className="wallet-checker">
      <h2>Check {networkName} Balance</h2>
      <div className="form-group">
        <label htmlFor="solanaWalletAddress">Wallet Address</label>
        <input
          id="solanaWalletAddress"
          type="text"
          placeholder="Enter Solana wallet address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="input-field"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="solanaThresholdAmount">Low Balance Threshold (SOL)</label>
        <input
          id="solanaThresholdAmount"
          type="number"
          placeholder="Optional: Set low balance alert"
          value={notificationThreshold}
          onChange={(e) => setNotificationThreshold(e.target.value)}
          className="input-field"
        />
      </div>
      
      <div className="button-group">
        <button
          onClick={checkBalance}
          disabled={loading || monitoring}
          className="button primary"
        >
          {loading ? 'Checking...' : 'Check Balance'}
        </button>
        
        <button
          onClick={toggleMonitoring}
          disabled={!address}
          className={`button ${monitoring ? 'danger' : 'secondary'}`}
        >
          {monitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>
      </div>
      
      {monitoring && (
        <div className="monitoring-status">
          <div className="pulse-indicator"></div>
          <span>Monitoring balance every 30 seconds</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {balance !== null && (
        <div className="balance-display">
          <h3>Wallet: {address.slice(0, 6)}...{address.slice(-4)}</h3>
          <div className="balance-amount">
            {balance} SOL
          </div>
          <a
            href={getExplorerUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="explorer-link"
          >
            View on Solana Explorer
          </a>
        </div>
      )}
    </div>
  );
};

export default SolanaWalletChecker;