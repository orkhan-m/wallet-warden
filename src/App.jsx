import { useState } from "react";
import "./App.css";
import WalletSearch from "./components/WalletSearch";
import WalletOverview from "./components/WalletOverview";
import TransactionHistory from "./components/TransactionHistory";
import TokenHoldings from "./components/TokenHoldings";
import TransactionChart from "./components/TransactionChart";
import BlockscoutAPI from "./services/blockscoutApi";
import ReputationAnalyzer from "./utils/reputationAnalyzer";

function App() {
  const [loading, setLoading] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [reputation, setReputation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState("");
  const [error, setError] = useState("");

  const analyzeWallet = async (address) => {
    setLoading(true);
    setError("");
    setCurrentAddress(address);

    try {
      // Fetch all data concurrently
      const [walletInfo, txData, tokenData] = await Promise.all([
        BlockscoutAPI.getWalletInfo(address),
        BlockscoutAPI.getTransactions(address, 1, 20).catch(() => ({
          items: [],
        })),
        BlockscoutAPI.getTokenHoldings(address).catch(() => ({ items: [] })),
      ]);

      // Validate that we got some data
      if (!walletInfo || walletInfo.error) {
        throw new Error(
          "Unable to fetch wallet information. The address might be invalid or not found."
        );
      }

      console.log("Wallet data:", { walletInfo, txData, tokenData }); // Debug log

      setWalletData(walletInfo);
      setTransactions(txData);
      setTokens(tokenData);

      // Calculate reputation
      const reputationData = ReputationAnalyzer.calculateReputation(
        walletInfo,
        txData,
        tokenData
      );
      setReputation(reputationData);
    } catch (err) {
      console.error("Error analyzing wallet:", err);
      setError(
        err.message ||
          "Failed to analyze wallet. Please check the address and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setWalletData(null);
    setTransactions(null);
    setTokens(null);
    setReputation(null);
    setCurrentAddress("");
    setError("");
  };

  return (
    <div className="app">
      <div className="container">
        {!walletData ? (
          <WalletSearch onSearch={analyzeWallet} loading={loading} />
        ) : (
          <div className="analysis-results">
            <button onClick={resetAnalysis} className="back-button">
              ← Analyze Another Wallet
            </button>

            <WalletOverview
              walletData={walletData}
              reputation={reputation}
              address={currentAddress}
              transactions={transactions}
            />

            <div className="content-grid">
              <div className="left-column">
                <TransactionHistory
                  transactions={transactions}
                  address={currentAddress}
                />
                <TransactionChart transactions={transactions} />
              </div>

              <div className="right-column">
                <TokenHoldings tokens={tokens} />
              </div>
            </div>
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Analyzing wallet reputation...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
