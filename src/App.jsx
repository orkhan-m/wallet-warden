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
      // Use comprehensive analysis for better API utilization
      const analysisData = await BlockscoutAPI.getComprehensiveAnalysis(
        address
      );

      // Set individual data states
      setWalletData(analysisData.walletInfo);
      setTransactions(analysisData.transactions);
      setTokens(analysisData.tokens);

      // Enhanced reputation analysis with all available data
      const reputationScore = ReputationAnalyzer.calculateReputation(
        analysisData.walletInfo,
        analysisData.transactions,
        analysisData.tokens,
        {
          internalTransactions: analysisData.internalTransactions,
          tokenTransfers: analysisData.tokenTransfers,
          balanceHistory: analysisData.balanceHistory,
          counters: analysisData.counters,
        }
      );

      setReputation(reputationScore);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(
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
