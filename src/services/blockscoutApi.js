import axios from "axios";

const BLOCKSCOUT_BASE_URL = "https://eth.blockscout.com/api/v2";

const api = axios.create({
  baseURL: BLOCKSCOUT_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

class BlockscoutAPI {
  async getWalletInfo(address) {
    try {
      const response = await api.get(`/addresses/${address}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching wallet info:", error);
      throw new Error("Failed to fetch wallet information");
    }
  }

  async getTransactions(address, limit = 20) {
    try {
      const response = await api.get(`/addresses/${address}/transactions`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw new Error("Failed to fetch transactions");
    }
  }

  async getTokenHoldings(address, limit = 50) {
    try {
      const response = await api.get(`/addresses/${address}/tokens`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching token holdings:", error);
      throw new Error("Failed to fetch token holdings");
    }
  }
}

export default new BlockscoutAPI();
