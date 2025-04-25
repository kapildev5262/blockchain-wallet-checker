const { ethers } = require('ethers');
const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

// EVM Chains Configuration
const evmChains = [
  {
    id: 1,
    name: "Ethereum Mainnet",
    rpcUrl: process.env.ETH_MAINNET_RPC || "https://eth-mainnet.g.alchemy.com/v2/your-api-key",
    symbol: "ETH"
  },
  {
    id: 8453,
    name: "Base",
    rpcUrl: process.env.BASE_RPC || "https://mainnet.base.org",
    symbol: "ETH"
  },
  // Testnets
  {
    id: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: process.env.SEPOLIA_RPC || "https://eth-sepolia.g.alchemy.com/v2/your-api-key",
    symbol: "ETH",
    isTestnet: true
  },
  {
    id: 84532,
    name: "Base Sepolia Testnet",
    rpcUrl: process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org",
    symbol: "ETH",
    isTestnet: true
  },
];

// Solana networks
const solanaNetworks = [
  {
    name: "Solana Mainnet",
    endpoint: process.env.SOLANA_MAINNET_RPC || "https://api.mainnet-beta.solana.com",
    symbol: "SOL"
  },
  {
    name: "Solana Testnet",
    endpoint: process.env.SOLANA_TESTNET_RPC || "https://api.testnet.solana.com",
    symbol: "SOL",
    isTestnet: true
  }
];

/**
 * Check balance of an EVM wallet across multiple chains
 * @param {string} address - EVM wallet address
 * @param {boolean} includeTestnets - Whether to include testnet chains
 * @returns {Promise<Array>} - Array of balance objects
 */
async function checkEvmBalances(address, includeTestnets = true) {
  // For ethers v6 we use isAddress directly
  if (!ethers.isAddress(address)) {
    throw new Error('Invalid EVM wallet address');
  }

  const chains = includeTestnets 
    ? evmChains 
    : evmChains.filter(chain => !chain.isTestnet);

  const results = [];
  
  for (const chain of chains) {
    try {
      console.log(`Checking ${chain.name}...`);
      // In ethers v6, JsonRpcProvider takes a URL directly
      const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
      
      // Check if provider is connected
      await provider.getNetwork();
      
      const balanceWei = await provider.getBalance(address);
      // In ethers v6, we use formatEther from ethers directly
      const balance = ethers.formatEther(balanceWei);
      
      results.push({
        chain: chain.name,
        chainId: chain.id,
        symbol: chain.symbol,
        balance: parseFloat(balance),
        isTestnet: !!chain.isTestnet
      });
    } catch (err) {
      console.error(`Error checking ${chain.name}:`, err.message);
      results.push({
        chain: chain.name,
        chainId: chain.id,
        symbol: chain.symbol,
        error: err.message,
        isTestnet: !!chain.isTestnet
      });
    }
  }
  
  return results;
}

/**
 * Check balance of a Solana wallet
 * @param {string} address - Solana wallet address
 * @param {boolean} includeTestnets - Whether to include testnet
 * @returns {Promise<Array>} - Array of balance objects
 */
async function checkSolanaBalances(address, includeTestnets = true) {
  const results = [];
  
  const networks = includeTestnets 
    ? solanaNetworks 
    : solanaNetworks.filter(network => !network.isTestnet);
  
  for (const network of networks) {
    try {
      console.log(`Checking ${network.name}...`);
      
      // Validate Solana address
      const publicKey = new PublicKey(address);
      
      const connection = new Connection(network.endpoint);
      const balanceLamports = await connection.getBalance(publicKey);
      
      // Convert from lamports to SOL (1 SOL = 10^9 lamports)
      const balance = balanceLamports / 1_000_000_000;
      
      results.push({
        network: network.name,
        symbol: network.symbol,
        balance,
        isTestnet: !!network.isTestnet
      });
    } catch (err) {
      console.error(`Error checking ${network.name}:`, err.message);
      results.push({
        network: network.name,
        symbol: network.symbol,
        error: err.message,
        isTestnet: !!network.isTestnet
      });
    }
  }
  
  return results;
}

/**
 * Main function to check balances
 */
async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(`
Usage: node balance-checker.js [options] <address>

Options:
  --evm-only             Check only EVM chains
  --solana-only          Check only Solana networks
  --no-testnets          Exclude testnets
  --help                 Show this help message

Examples:
  node balance-checker.js 0x123...                    # Check all networks
  node balance-checker.js --evm-only 0x123...         # Check only EVM chains
  node balance-checker.js --solana-only Gh7...        # Check only Solana networks
  node balance-checker.js --no-testnets 0x123...      # Exclude testnets
`);
    return;
  }

  // Parse options
  const options = {
    evmOnly: args.includes('--evm-only'),
    solanaOnly: args.includes('--solana-only'),
    includeTestnets: !args.includes('--no-testnets')
  };

  // Get address (last argument that doesn't start with --)
  const address = args.filter(arg => !arg.startsWith('--')).pop();

  if (!address) {
    console.error('Error: No address provided');
    return;
  }

  console.log(`Checking balances for address: ${address}`);
  console.log(`Include testnets: ${options.includeTestnets ? 'Yes' : 'No'}`);
  
  try {
    // Check EVM balances unless solana-only is specified
    let evmResults = [];
    if (!options.solanaOnly) {
      try {
        evmResults = await checkEvmBalances(address, options.includeTestnets);
        console.log('\nEVM Balances:');
        evmResults.forEach(result => {
          if (result.error) {
            console.log(`  ${result.chain}: Error - ${result.error}`);
          } else {
            console.log(`  ${result.chain}: ${result.balance} ${result.symbol}${result.isTestnet ? ' (testnet)' : ''}`);
          }
        });
      } catch (err) {
        console.error('Error checking EVM balances:', err.message);
      }
    }
    
    // Check Solana balances unless evm-only is specified
    let solanaResults = [];
    if (!options.evmOnly) {
      try {
        solanaResults = await checkSolanaBalances(address, options.includeTestnets);
        console.log('\nSolana Balances:');
        solanaResults.forEach(result => {
          if (result.error) {
            console.log(`  ${result.network}: Error - ${result.error}`);
          } else {
            console.log(`  ${result.network}: ${result.balance} ${result.symbol}${result.isTestnet ? ' (testnet)' : ''}`);
          }
        });
      } catch (err) {
        console.error('Error checking Solana balances:', err.message);
      }
    }
    
    // Summarize 
    console.log('\nSummary:');
    const totalNonZeroBalances = [...evmResults, ...solanaResults].filter(r => r.balance > 0).length;
    console.log(`Found ${totalNonZeroBalances} non-zero balances across all chains.`);
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Run the main function
main().catch(console.error);