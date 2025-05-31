import { Coins, ExternalLink } from "lucide-react";
import ReputationAnalyzer from "../utils/reputationAnalyzer";

const TokenHoldings = ({ tokens }) => {
  if (!tokens || !tokens.items || tokens.items.length === 0) {
    return (
      <div className="token-holdings">
        <h3 className="section-title">
          <Coins size={20} />
          Token Holdings
        </h3>
        <div className="no-data">No tokens found</div>
      </div>
    );
  }

  const formatTokenValue = (value, decimals) => {
    try {
      const divisor = Math.pow(10, decimals || 18);
      const tokenValue = parseFloat(value) / divisor;
      return tokenValue.toFixed(4);
    } catch (error) {
      return "0";
    }
  };

  return (
    <div className="token-holdings">
      <h3 className="section-title">
        <Coins size={20} />
        Token Holdings ({tokens.items.length})
      </h3>

      <div className="token-list">
        {tokens.items.map((token, index) => (
          <div key={token.token?.address || index} className="token-item">
            <div className="token-info">
              {token.token?.icon_url && (
                <img
                  src={token.token.icon_url}
                  alt={token.token.name}
                  className="token-icon"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              <div className="token-details">
                <div className="token-name">
                  {token.token?.name || "Unknown Token"}
                  <span className="token-symbol">
                    ({token.token?.symbol || "N/A"})
                  </span>
                </div>
                <div className="token-address">
                  <a
                    href={`https://eth.blockscout.com/token/${token.token?.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="address-link"
                  >
                    {ReputationAnalyzer.formatAddress(token.token?.address)}
                    <ExternalLink size={12} />
                  </a>
                  {token.token?.is_verified && (
                    <span className="verified-badge">Verified</span>
                  )}
                </div>
              </div>
            </div>

            <div className="token-balance">
              <div className="balance-value">
                {formatTokenValue(token.value, token.token?.decimals)}
              </div>
              <div className="balance-label">
                {token.token?.symbol || "Tokens"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {tokens.next_page_params && (
        <div className="load-more">
          <span className="more-indicator">+ More tokens available</span>
        </div>
      )}
    </div>
  );
};

export default TokenHoldings;
