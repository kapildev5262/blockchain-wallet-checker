// src/components/NetworkSelector.jsx
import React from 'react';
import { evmChains } from '../utils/evmChains';

const NetworkSelector = ({ selectedChain, onChainSelect, includeTestnets }) => {
  const chains = includeTestnets
    ? evmChains
    : evmChains.filter(chain => !chain.isTestnet);

  return (
    <div className="network-selector">
      <label htmlFor="networkSelect">Select Network</label>
      <select
        id="networkSelect"
        value={selectedChain}
        onChange={(e) => onChainSelect(e.target.value)}
        className="select-field"
      >
        {chains.map((chain) => (
          <option key={chain.id} value={chain.id.toString()}>
            {chain.name} ({chain.symbol})
          </option>
        ))}
        <option value="solana">Solana</option>
        <option value="solana-testnet">Solana Testnet</option>
      </select>
    </div>
  );
};

export default NetworkSelector;