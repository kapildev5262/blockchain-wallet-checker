// src/utils/evmChains.js
export const evmChains = [
  {
    id: 1,
    name: "Ethereum Mainnet",
    rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/iIks_aShfkGOF8-Nl658iTVe9kxC62jM",
    symbol: "ETH",
    blockExplorer: "https://etherscan.io"
  },
  {
    id: 137,
    name: "Polygon",
    rpcUrl: "https://polygon-mainnet.g.alchemy.com/v2/iIks_aShfkGOF8-Nl658iTVe9kxC62jM",
    symbol: "MATIC",
    blockExplorer: "https://polygonscan.com"
  },
  {
    id: 56,
    name: "Binance Smart Chain",
    rpcUrl: "https://bsc-dataseed.binance.org/",
    symbol: "BNB",
    blockExplorer: "https://bscscan.com"
  },
  {
    id: 43114,
    name: "Avalanche",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    symbol: "AVAX",
    blockExplorer: "https://snowtrace.io"
  },
  {
    id: 8453,
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    symbol: "ETH",
    blockExplorer: "https://basescan.org"
  },
  // Testnets
  {
    id: 5,
    name: "Goerli Testnet",
    rpcUrl: "https://eth-goerli.g.alchemy.com/v2/your-api-key",
    symbol: "ETH",
    blockExplorer: "https://goerli.etherscan.io",
    isTestnet: true
  },
  {
    id: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/iIks_aShfkGOF8-Nl658iTVe9kxC62jM",
    symbol: "ETH",
    blockExplorer: "https://sepolia.etherscan.io",
    isTestnet: true
  },
  {
    id: 80001,
    name: "Mumbai Testnet",
    rpcUrl: "https://polygon-mumbai.g.alchemy.com/v2/your-api-key",
    symbol: "MATIC",
    blockExplorer: "https://mumbai.polygonscan.com",
    isTestnet: true
  },
  {
    id: 97,
    name: "BSC Testnet",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    symbol: "tBNB",
    blockExplorer: "https://testnet.bscscan.com",
    isTestnet: true
  },
  {
    id: 43113,
    name: "Avalanche Fuji Testnet",
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    symbol: "AVAX",
    blockExplorer: "https://testnet.snowtrace.io",
    isTestnet: true
  },
  {
    id: 84532,
    name: "Base Sepolia Testnet",
    rpcUrl: "https://sepolia.base.org",
    symbol: "ETH",
    blockExplorer: "https://sepolia.basescan.org",
    isTestnet: true
  }
];
