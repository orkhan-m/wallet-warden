import { ethers } from "ethers";

export const formatAddress = (address, startLength = 6, endLength = 4) => {
  if (!address) return "";
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

export const formatEthValue = (value, decimals = 4) => {
  if (!value) return "0";
  try {
    const formatted = ethers.formatEther(value);
    return parseFloat(formatted).toFixed(decimals);
  } catch (error) {
    return "0";
  }
};
