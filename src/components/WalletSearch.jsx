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
              setAddress("0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8")
            }
            className="example-btn"
          >
            Binance
          </button>
          <button
            onClick={() =>
              setAddress("0x40B38765696e3d5d8d9d834D8AaD4bB6e418E489")
            }
            className="example-btn"
          >
            Robinhood
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletSearch;
