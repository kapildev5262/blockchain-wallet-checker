// src/App.jsx
import React, { useState } from 'react';
import NetworkSelector from './components/NetworkSelector';
import EvmWalletChecker from './components/EvmWalletChecker';
import SolanaWalletChecker from './components/SolanaWalletChecker';
import { evmChains } from './utils/evmChains';
import './App.css';

function App() {
  const [selectedChain, setSelectedChain] = useState(evmChains[0].id.toString());
  const [includeTestnets, setIncludeTestnets] = useState(true);

  const renderWalletChecker = () => {
    if (selectedChain === 'solana') {
      return <SolanaWalletChecker isTestnet={false} />;
    } else if (selectedChain === 'solana-testnet') {
      return <SolanaWalletChecker isTestnet={true} />;
    } else {
      return <EvmWalletChecker chainId={selectedChain} />;
    }
  };

  return (
    <div className="app-container">
      <div className="app-card">
        <header className="app-header">
          <h1>Blockchain Wallet Balance Checker</h1>
        </header>
        <div className="app-content">
          <div className="network-options">
            <NetworkSelector
              selectedChain={selectedChain}
              onChainSelect={setSelectedChain}
              includeTestnets={includeTestnets}
            />
            <div className="testnet-toggle">
              <input
                type="checkbox"
                id="testnetToggle"
                checked={includeTestnets}
                onChange={() => setIncludeTestnets(!includeTestnets)}
                className="toggle-checkbox"
              />
              <label htmlFor="testnetToggle" className="toggle-label">Include Testnets</label>
            </div>
          </div>
          <div className="wallet-checker-container">
            {renderWalletChecker()}
          </div>
        </div>
        <footer className="app-footer">
          <p>Replace RPC URLs with your API keys for production use</p>
        </footer>
      </div>
    </div>
  );
}

export default App;