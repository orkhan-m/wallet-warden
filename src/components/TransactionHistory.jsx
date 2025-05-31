import { ExternalLink, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import ReputationAnalyzer from "../utils/reputationAnalyzer";

const TransactionHistory = ({ transactions, address }) => {
  if (!transactions || !transactions.items || transactions.items.length === 0) {
    return (
      <div className="transaction-history">
        <h3 className="section-title">
          <Clock size={20} />
          Recent Transactions
        </h3>
        <div className="no-data">No transactions found</div>
      </div>
    );
  }

  const isOutgoing = (tx) =>
    tx.from.hash.toLowerCase() === address.toLowerCase();

  return (
    <div className="transaction-history">
      <h3 className="section-title">
        <Clock size={20} />
        Recent Transactions ({transactions.items.length})
      </h3>

      <div className="transaction-list">
        {transactions.items.map((tx, index) => (
          <div key={tx.hash || index} className="transaction-item">
            <div className="tx-direction">
              {isOutgoing(tx) ? (
                <ArrowUpRight className="tx-icon outgoing" size={20} />
              ) : (
                <ArrowDownLeft className="tx-icon incoming" size={20} />
              )}
            </div>

            <div className="tx-details">
              <div className="tx-hash">
                <a
                  href={`https://eth.blockscout.com/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hash-link"
                >
                  {ReputationAnalyzer.formatAddress(tx.hash)}
                  <ExternalLink size={12} />
                </a>
                {tx.to?.is_contract && (
                  <span className="contract-badge">Contract</span>
                )}
                {tx.to?.is_verified && (
                  <span className="verified-badge">Verified</span>
                )}
              </div>

              <div className="tx-addresses">
                <span className="from-to">
                  {isOutgoing(tx) ? "To: " : "From: "}
                  <span className="address">
                    {ReputationAnalyzer.formatAddress(
                      isOutgoing(tx) ? tx.to?.hash : tx.from?.hash
                    )}
                  </span>
                </span>
              </div>

              <div className="tx-meta">
                <span className="tx-time">
                  {ReputationAnalyzer.formatDate(tx.timestamp)}
                </span>
                {tx.method && <span className="tx-method">{tx.method}</span>}
              </div>
            </div>

            <div className="tx-value">
              <span
                className={`value ${isOutgoing(tx) ? "outgoing" : "incoming"}`}
              >
                {isOutgoing(tx) ? "-" : "+"}
                {ReputationAnalyzer.formatValue(tx.value)} ETH
              </span>
              {tx.fee && (
                <span className="tx-fee">
                  Fee: {ReputationAnalyzer.formatValue(tx.fee)} ETH
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {transactions.next_page_params && (
        <div className="load-more">
          <a
            href={`https://eth.blockscout.com/address/${address}/transactions`}
            target="_blank"
            rel="noopener noreferrer"
            className="load-more-link"
          >
            View all transactions on Blockscout <ExternalLink size={14} />
          </a>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
