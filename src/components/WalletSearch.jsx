import { useState } from "react";
import { Search } from "lucide-react";
import { ethers } from "ethers";

const WalletSearch = ({ onSearch, loading }) => {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!address.trim()) {
      setError("Please enter a wallet address");
      return;
    }

    if (!ethers.isAddress(address)) {
      setError("Please enter a valid Ethereum address");
      return;
    }

    onSearch(address.trim());
  };

  return (
    <div className="search-container">
      <h1 className="app-title">🛡️ Wallet Warden</h1>
      <p className="app-subtitle">
        Analyze Web3 wallet reputation using Blockscout
      </p>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter wallet address (0x...)"
            className="search-input"
            disabled={loading}
          />
          <button
            type="submit"
            className="search-button"
            disabled={loading || !address.trim()}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </form>

      <div className="example-addresses">
        <p>Try these example addresses:</p>
        <div className="examples">
          <button
            onClick={() =>
              setAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045")
            }
            className="example-btn"
          >
            Vitalik.eth
          </button>
          <button
            onClick={() =>
              setAddress("0x742d35Cc6634C0532925a3b8D60D5583CD1C9543")
            }
            className="example-btn"
          >
            Sample Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletSearch;
