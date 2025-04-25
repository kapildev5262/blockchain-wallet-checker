// src/utils/helpers.js
export const shortenAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance, decimals = 18) => {
  if (!balance) return "0";
  return (parseFloat(balance) / 10 ** decimals).toFixed(4);
};
