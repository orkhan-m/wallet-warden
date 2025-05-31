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

export const isValidAddress = (address) => {
  return ethers.isAddress(address);
};

export const formatNumber = (num, decimals = 2) => {
  if (typeof num !== "number") return "0";
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

export const getTimeAgo = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now - time) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};
