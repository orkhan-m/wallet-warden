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

  // Enhanced API endpoints for comprehensive analysis
  async getInternalTransactions(address, limit = 20) {
    try {
      const response = await api.get(
        `/addresses/${address}/internal-transactions`,
        {
          params: { limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching internal transactions:", error);
      return { items: [] }; // Return empty array instead of throwing
    }
  }

  async getContractDetails(contractAddress) {
    try {
      const response = await api.get(`/addresses/${contractAddress}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching contract details:", error);
      return null;
    }
  }

  async getTransactionDetails(txHash) {
    try {
      const response = await api.get(`/transactions/${txHash}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      return null;
    }
  }

  async getCoinBalanceHistory(address, limit = 30) {
    try {
      const response = await api.get(
        `/addresses/${address}/coin-balance-history`,
        {
          params: { limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching balance history:", error);
      return { items: [] };
    }
  }

  async getTokenTransfers(address, limit = 50) {
    try {
      const response = await api.get(`/addresses/${address}/token-transfers`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching token transfers:", error);
      return { items: [] };
    }
  }

  async getAddressCounters(address) {
    try {
      const response = await api.get(`/addresses/${address}/counters`);
      return response.data;
    } catch (error) {
      console.error("Error fetching address counters:", error);
      return {};
    }
  }

  // Comprehensive wallet analysis using multiple endpoints
  async getComprehensiveAnalysis(address) {
    try {
      const [
        walletInfo,
        transactions,
        tokens,
        internalTxs,
        tokenTransfers,
        balanceHistory,
        counters,
      ] = await Promise.allSettled([
        this.getWalletInfo(address),
        this.getTransactions(address, 50),
        this.getTokenHoldings(address, 100),
        this.getInternalTransactions(address, 30),
        this.getTokenTransfers(address, 50),
        this.getCoinBalanceHistory(address, 30),
        this.getAddressCounters(address),
      ]);

      return {
        walletInfo: walletInfo.status === "fulfilled" ? walletInfo.value : null,
        transactions:
          transactions.status === "fulfilled"
            ? transactions.value
            : { items: [] },
        tokens: tokens.status === "fulfilled" ? tokens.value : { items: [] },
        internalTransactions:
          internalTxs.status === "fulfilled"
            ? internalTxs.value
            : { items: [] },
        tokenTransfers:
          tokenTransfers.status === "fulfilled"
            ? tokenTransfers.value
            : { items: [] },
        balanceHistory:
          balanceHistory.status === "fulfilled"
            ? balanceHistory.value
            : { items: [] },
        counters: counters.status === "fulfilled" ? counters.value : {},
      };
    } catch (error) {
      console.error("Error in comprehensive analysis:", error);
      throw error;
    }
  }
}

export default new BlockscoutAPI();
