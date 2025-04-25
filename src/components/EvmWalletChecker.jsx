// src/components/EvmWalletChecker.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { evmChains } from '../utils/evmChains';
import { formatBalance, shortenAddress } from '../utils/helpers';

const EvmWalletChecker = ({ chainId }) => {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(null);
  const [previousBalance, setPreviousBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [monitoring, setMonitoring] = useState(false);
  const [notificationThreshold, setNotificationThreshold] = useState('');
  const [notification, setNotification] = useState(null);
  
  const monitoringIntervalRef = useRef(null);
  const chain = evmChains.find(c => c.id === parseInt(chainId));

  // Clear monitoring when component unmounts or chainId changes
  useEffect(() => {
    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, [chainId]);

  // Reset state when chain changes
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
  }, [chainId]);

  const checkBalance = async () => {
    if (!address) {
      setError('Please enter a wallet address');
      return;
    }

    if (!ethers.utils.isAddress(address)) {
      setError('Invalid EVM wallet address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);
      const balanceWei = await provider.getBalance(address);
      const formattedBalance = ethers.utils.formatEther(balanceWei);
      
      if (balance !== null) {
        setPreviousBalance(balance);
      }
      
      setBalance(formattedBalance);
      
      // Check if balance is below threshold
      if (notificationThreshold && parseFloat(formattedBalance) < parseFloat(notificationThreshold)) {
        setNotification({
          type: 'warning',
          message: `Balance is below threshold of ${notificationThreshold} ${chain.symbol}!`
        });
      } else {
        setNotification(null);
      }
      
      // If balance changed, notify
      if (previousBalance !== null && previousBalance !== formattedBalance) {
        const diff = parseFloat(formattedBalance) - parseFloat(previousBalance);
        const sign = diff > 0 ? '+' : '';
        
        setNotification({
          type: diff >= 0 ? 'info' : 'warning',
          message: `Balance changed by ${sign}${diff.toFixed(6)} ${chain.symbol}`
        });
      }
      
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError(`Failed to fetch balance: ${err.message}`);
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

  return (
    <div className="wallet-checker">
      <h2>Check {chain.name} Balance</h2>
      <div className="form-group">
        <label htmlFor="walletAddress">Wallet Address</label>
        <input
          id="walletAddress"
          type="text"
          placeholder="Enter wallet address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="input-field"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="thresholdAmount">Low Balance Threshold ({chain.symbol})</label>
        <input
          id="thresholdAmount"
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
          disabled={!address || !ethers.utils.isAddress(address)}
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
          <h3>Wallet: {shortenAddress(address)}</h3>
          <div className="balance-amount">
            {balance} {chain.symbol}
          </div>
          <a
            href={`${chain.blockExplorer}/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="explorer-link"
          >
            View on {chain.blockExplorer.split('://')[1]}
          </a>
        </div>
      )}
    </div>
  );
};

export default EvmWalletChecker;