import { ExternalLink, Wallet, Shield, AlertTriangle } from "lucide-react";
import ReputationAnalyzer from "../utils/reputationAnalyzer";

const WalletOverview = ({ walletData, reputation, address, transactions }) => {
  if (!walletData) return null;

  const balance = walletData.coin_balance
    ? ReputationAnalyzer.formatValue(walletData.coin_balance, 6)
    : "0";

  // Use default reputation if not available
  const safeReputation =
    reputation || ReputationAnalyzer.getDefaultReputation();
  const gradeColor = ReputationAnalyzer.getGradeColor(safeReputation.grade);
  const reputationBadge = ReputationAnalyzer.getReputationBadge(safeReputation.score);

  // Get transaction count from the fetched data
  const transactionCount = transactions?.items?.length || 0;

  return (
    <div className="wallet-overview">
      <div className="overview-header">
        <div className="wallet-info">
          <Wallet className="wallet-icon" size={24} />
          <div>
            <h2 className="wallet-address">
              {ReputationAnalyzer.formatAddress(address)}
              {walletData.ens_domain_name && (
                <span className="ens-name">({walletData.ens_domain_name})</span>
              )}
            </h2>
            <a
              href={`https://eth.blockscout.com/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="blockscout-link"
            >
              View on Blockscout <ExternalLink size={14} />
            </a>
          </div>
        </div>

        <div className="reputation-score" style={{ borderColor: gradeColor }}>
          <div className="score-circle" style={{ backgroundColor: gradeColor }}>
            <span className="score-grade">{safeReputation.grade}</span>
          </div>
          <div>
            <div 
              className="reputation-badge" 
              style={{ backgroundColor: reputationBadge.color }}
              title={reputationBadge.description}
            >
              <span className="reputation-badge-icon">{reputationBadge.icon}</span>
              {reputationBadge.label}
            </div>
            <div className="score-value">{safeReputation.score}/100</div>
            <div className="score-label">Reputation Score</div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{balance} ETH</div>
          <div className="stat-label">Balance</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{transactionCount}</div>
          <div className="stat-label">Recent Transactions</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            {safeReputation.uniqueContractCount || 0}
          </div>
          <div className="stat-label">Unique Contracts</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            {(safeReputation.metrics?.totalVolume || 0).toFixed(4)} ETH
          </div>
          <div className="stat-label">Total Volume</div>
        </div>
      </div>

      {/* Risk Flags */}
      {safeReputation.metrics?.riskFlags?.length > 0 && (
        <div className="risk-section">
          <h3 className="section-title">
            <AlertTriangle className="risk-icon" size={20} />
            Risk Flags
          </h3>
          <div className="risk-flags">
            {safeReputation.metrics.riskFlags.map((flag, index) => (
              <div key={index} className="risk-flag">
                {flag}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Merits */}
      {safeReputation.metrics?.merits?.length > 0 && (
        <div className="merits-section">
          <h3 className="section-title">
            <Shield className="merit-icon" size={20} />
            Merits
          </h3>
          <div className="merits">
            {safeReputation.metrics.merits.map((merit, index) => (
              <div key={index} className="merit">
                {merit}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletOverview;
