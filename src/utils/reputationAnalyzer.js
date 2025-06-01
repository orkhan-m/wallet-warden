import { ethers } from "ethers";

// Known contract addresses for risk assessment
const RISKY_CONTRACTS = new Set([
  // Tornado Cash contracts (verified addresses)
  "0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc", // Tornado Cash 0.1 ETH
  "0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936", // Tornado Cash 1 ETH
  "0x910cbd523d972eb0a6f4cae4618ad62622b39dbf", // Tornado Cash 10 ETH
  "0xa160cdab225685da1d56aa342ad8841c3b53f291", // Tornado Cash 100 ETH
  // Additional known mixers and suspicious contracts
  "0x000000000000000000000000000000000000dead", // Burn address (suspicious if interacting)
  "0x0000000000000000000000000000000000000000", // Zero address
]);

const VERIFIED_CONTRACTS = new Set([
  // Major DeFi protocols
  "0xa0b86a33e6c741a05a2a2c9b823c72bf23a46104", // Uniswap
  "0x7a250d5630b4cf539739df2c5dacb4c659f2488d", // Uniswap Router
  "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
  "0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b", // CRO
  "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", // UNI
]);

// Suspicious transaction patterns
const SUSPICIOUS_PATTERNS = {
  MAX_DAILY_TRANSACTIONS: 200, // More than this suggests bot activity
  MIN_TRANSACTION_VALUE: 0.001, // ETH - too many tiny transactions are suspicious
  MAX_SAME_VALUE_RATIO: 0.8, // If 80%+ transactions are same value = bot
};

export class ReputationAnalyzer {
  static calculateReputation(
    walletData,
    transactions,
    tokens,
    enhancedData = {}
  ) {
    let score = 40; // Moderately harsh base score - 20% less harsh
    const metrics = {
      totalVolume: 0,
      transactionCount: 0,
      uniqueContracts: new Set(),
      riskFlags: [],
      merits: [],
      averageTransactionValue: 0,
      diversityScore: 0,
      frequencyScore: 0,
      // Enhanced metrics using additional API data
      internalTxCount: 0,
      tokenTransferCount: 0,
      contractInteractionDepth: 0,
      balanceStability: 0,
      verifiedContractRatio: 0,
    };

    // Validate input data
    if (!walletData) {
      console.warn("No wallet data provided to reputation analyzer");
      return this.getDefaultReputation();
    }

    // Analyze transactions
    if (
      transactions &&
      transactions.items &&
      Array.isArray(transactions.items)
    ) {
      try {
        metrics.transactionCount = transactions.items.length;

        // ADDITIONAL HARSH PATTERN DETECTION
        const transactionValues = [];
        const dailyTransactionCounts = new Map();
        let tinyTransactionCount = 0;

        transactions.items.forEach((tx) => {
          try {
            // Track transaction values for pattern analysis
            let value = 0;
            if (tx.value !== null && tx.value !== undefined) {
              try {
                value = parseFloat(ethers.formatEther(tx.value));
                if (isNaN(value)) value = 0;
              } catch (err) {
                console.warn("Error parsing transaction value:", tx.value, err);
                value = 0;
              }
            }

            transactionValues.push(value);

            // Count tiny transactions (dust attacks, spam)
            if (
              value > 0 &&
              value < SUSPICIOUS_PATTERNS.MIN_TRANSACTION_VALUE
            ) {
              tinyTransactionCount++;
            }

            // Track daily transaction counts
            if (tx.timestamp) {
              const date = new Date(tx.timestamp).toDateString();
              dailyTransactionCounts.set(
                date,
                (dailyTransactionCounts.get(date) || 0) + 1
              );
            }

            metrics.totalVolume += value;

            // Track unique contracts
            if (tx.to && tx.to.is_contract && tx.to.hash) {
              metrics.uniqueContracts.add(tx.to.hash);

              // Check for risky contracts - Moderately harsh penalties
              if (RISKY_CONTRACTS.has(tx.to.hash.toLowerCase())) {
                metrics.riskFlags.push(
                  `Interaction with risky contract: ${tx.to.hash}`
                );
                score -= 20; // Reduced from -25 to -20 (20% less harsh)
              }

              // Check for verified contracts - Slightly increased rewards
              if (
                VERIFIED_CONTRACTS.has(tx.to.hash.toLowerCase()) ||
                tx.to.is_verified
              ) {
                metrics.merits.push(
                  `Interaction with verified contract: ${tx.to.hash}`
                );
                score += 3; // Increased from +2 to +3
              }
            }
          } catch (txError) {
            console.warn("Error processing transaction:", tx, txError);
          }
        });

        // HARSH PENALTIES for suspicious patterns

        // 1. Excessive daily transactions (bot-like behavior) - 20% less harsh
        const maxDailyTx = Math.max(
          ...Array.from(dailyTransactionCounts.values())
        );
        if (maxDailyTx > SUSPICIOUS_PATTERNS.MAX_DAILY_TRANSACTIONS) {
          score -= 24; // Reduced from -30 to -24
          metrics.riskFlags.push(
            `Excessive daily transactions: ${maxDailyTx} in one day - likely bot`
          );
        } else if (maxDailyTx > 100) {
          score -= 12; // Reduced from -15 to -12
          metrics.riskFlags.push(
            `High daily transaction volume: ${maxDailyTx} - suspicious activity`
          );
        }

        // 2. Too many tiny/dust transactions - 20% less harsh
        const tinyTransactionRatio =
          tinyTransactionCount / Math.max(metrics.transactionCount, 1);
        if (tinyTransactionRatio > 0.5) {
          score -= 16; // Reduced from -20 to -16
          metrics.riskFlags.push(
            `High dust transaction ratio: ${(
              tinyTransactionRatio * 100
            ).toFixed(1)}% - spam behavior`
          );
        } else if (tinyTransactionRatio > 0.3) {
          score -= 8; // Reduced from -10 to -8
          metrics.riskFlags.push(
            `Moderate dust transactions: ${(tinyTransactionRatio * 100).toFixed(
              1
            )}%`
          );
        }

        // 3. Repeated same-value transactions (bot pattern)
        if (transactionValues.length > 10) {
          const valueCounts = new Map();
          transactionValues.forEach((val) => {
            if (val > 0) {
              const rounded = Math.round(val * 1000) / 1000; // Round to 3 decimals
              valueCounts.set(rounded, (valueCounts.get(rounded) || 0) + 1);
            }
          });

          const maxSameValueCount = Math.max(
            ...Array.from(valueCounts.values())
          );
          const sameValueRatio =
            maxSameValueCount / transactionValues.filter((v) => v > 0).length;

          if (sameValueRatio > SUSPICIOUS_PATTERNS.MAX_SAME_VALUE_RATIO) {
            score -= 20; // Reduced from -25 to -20
            metrics.riskFlags.push(
              `Repetitive transaction pattern: ${(sameValueRatio * 100).toFixed(
                1
              )}% same value - bot behavior`
            );
          } else if (sameValueRatio > 0.6) {
            score -= 10; // Reduced from -12 to -10
            metrics.riskFlags.push(
              `Moderate repetitive patterns: ${(sameValueRatio * 100).toFixed(
                1
              )}% same value`
            );
          }
        }

        // 4. Lack of transaction volume despite many transactions - 20% less harsh
        if (metrics.transactionCount > 50 && metrics.totalVolume < 0.1) {
          score -= 12; // Reduced from -15 to -12
          metrics.riskFlags.push(
            "High transaction count with minimal volume - suspicious activity"
          );
        }

        // Calculate average transaction value
        metrics.averageTransactionValue =
          metrics.totalVolume / Math.max(metrics.transactionCount, 1);

        // Penalties for insufficient activity - 20% less harsh
        if (metrics.transactionCount < 10) {
          score -= 12; // Reduced from -15 to -12
          metrics.riskFlags.push(
            `Very low transaction count: ${metrics.transactionCount} - inactive wallet`
          );
        } else if (metrics.transactionCount < 25) {
          score -= 6; // Reduced from -8 to -6
          metrics.riskFlags.push(
            `Low transaction count: ${metrics.transactionCount} - limited activity`
          );
        }

        // Penalty for very low total volume - 20% less harsh
        if (metrics.totalVolume < 0.01) {
          score -= 10; // Reduced from -12 to -10
          metrics.riskFlags.push(
            `Minimal transaction volume: ${metrics.totalVolume.toFixed(6)} ETH`
          );
        } else if (metrics.totalVolume < 0.1) {
          score -= 5; // Reduced from -6 to -5
          metrics.riskFlags.push(
            `Low transaction volume: ${metrics.totalVolume.toFixed(4)} ETH`
          );
        }

        // Diversity score - Moderately strict requirements
        if (metrics.uniqueContracts.size >= 5) {
          // Must have at least 5 unique contracts
          metrics.diversityScore = Math.min(
            (metrics.uniqueContracts.size - 4) * 1.8,
            18
          ); // Slightly increased multiplier and cap
          score += metrics.diversityScore;
        } else {
          // Reduced penalty for lack of diversity
          score -= (5 - metrics.uniqueContracts.size) * 1.6; // Reduced from 2 to 1.6
          metrics.riskFlags.push(
            `Limited contract interaction diversity (${metrics.uniqueContracts.size} contracts)`
          );
        }

        // Frequency analysis (more recent activity = better, but not too frequent)
        try {
          const now = new Date();
          const recentTxs = transactions.items.filter((tx) => {
            try {
              if (!tx.timestamp) return false;
              const txDate = new Date(tx.timestamp);
              if (isNaN(txDate.getTime())) return false;
              const daysDiff = (now - txDate) / (1000 * 60 * 60 * 24);
              return daysDiff <= 30; // Last 30 days
            } catch (err) {
              console.warn(
                "Error parsing transaction timestamp:",
                tx.timestamp,
                err
              );
              return false;
            }
          });

          if (recentTxs.length > 10 && recentTxs.length < 50) {
            // Same range but better rewards
            metrics.frequencyScore = Math.min(recentTxs.length * 0.6, 10); // Increased multiplier from 0.5 to 0.6
            score += metrics.frequencyScore;
          } else if (recentTxs.length >= 50) {
            // Reduced penalty for high frequency activity
            score -= 12; // Reduced from -15 to -12
            metrics.riskFlags.push(
              "Suspicious high frequency activity - possible bot"
            );
          } else if (recentTxs.length < 5) {
            // Reduced penalty for inactivity
            score -= 6; // Reduced from -8 to -6
            metrics.riskFlags.push(
              "Low activity level - minimal recent transactions"
            );
          }
        } catch (freqError) {
          console.warn("Error in frequency analysis:", freqError);
        }
      } catch (error) {
        console.warn("Error analyzing transactions:", error);
        metrics.riskFlags.push("Error analyzing transaction data");
      }
    } else {
      console.warn("No transaction data available for analysis");
    }

    // Analyze token holdings - Moderately strict requirements
    if (tokens && tokens.items) {
      const tokenCount = tokens.items.length;
      if (tokenCount >= 3) {
        // Must have at least 3 tokens for bonus
        score += Math.min((tokenCount - 2) * 1.2, 12); // Slightly increased bonus
        metrics.merits.push(`Holds ${tokenCount} different tokens`);
      } else if (tokenCount === 0) {
        // Reduced penalty for no token holdings
        score -= 4; // Reduced from -5 to -4
        metrics.riskFlags.push(
          "No token holdings - limited DeFi participation"
        );
      }
    }

    // Analyze wallet balance - Moderately strict requirements
    if (walletData && walletData.coin_balance) {
      try {
        const balance = parseFloat(ethers.formatEther(walletData.coin_balance));
        if (!isNaN(balance)) {
          if (balance > 0.5) {
            // Reduced minimum balance requirement from 1 to 0.5
            score += Math.min(Math.log10(balance + 1) * 4, 10); // Slightly increased multiplier and cap
            metrics.merits.push(
              `Maintains balance of ${balance.toFixed(4)} ETH`
            );
          } else if (balance < 0.01) {
            // Reduced penalty for dust balances
            score -= 6; // Reduced from -8 to -6
            metrics.riskFlags.push(
              "Minimal balance - possible inactive or depleted wallet"
            );
          }
        }
      } catch (balanceError) {
        console.warn(
          "Error analyzing wallet balance:",
          walletData.coin_balance,
          balanceError
        );
      }
    }

    // Enhanced analysis with internal transactions
    if (enhancedData.internalTransactions?.items) {
      metrics.internalTxCount = enhancedData.internalTransactions.items.length;

      // Analyze internal transaction patterns
      enhancedData.internalTransactions.items.forEach((tx) => {
        if (tx.to?.is_contract) {
          metrics.contractInteractionDepth++;
          metrics.uniqueContracts.add(tx.to.hash);
        }
      });

      // Moderately strict bonus for contract interactions
      if (metrics.contractInteractionDepth >= 8) {
        // Reduced threshold from 10 to 8
        score += Math.min((metrics.contractInteractionDepth - 7) * 1.2, 12); // Slightly increased bonus
        metrics.merits.push("Advanced DeFi user - High contract interaction");
      } else if (metrics.contractInteractionDepth < 5) {
        // Reduced penalty for limited contract interaction
        score -= 4; // Reduced from -5 to -4
        metrics.riskFlags.push("Limited smart contract interaction");
      }
    }

    // Enhanced analysis with token transfers
    if (enhancedData.tokenTransfers?.items) {
      metrics.tokenTransferCount = enhancedData.tokenTransfers.items.length;

      // Analyze token transfer patterns for sophistication
      const uniqueTokens = new Set();
      enhancedData.tokenTransfers.items.forEach((transfer) => {
        if (transfer.token?.address) {
          uniqueTokens.add(transfer.token.address);
        }
      });

      // Moderately strict bonus for token diversity
      if (uniqueTokens.size >= 8) {
        // Reduced requirement from 10 to 8
        const tokenDiversityBonus = Math.min((uniqueTokens.size - 7) * 1.2, 15); // Slightly increased multiplier and cap
        score += tokenDiversityBonus;
        metrics.merits.push(
          `Diverse token portfolio - ${uniqueTokens.size} different tokens`
        );
      } else if (uniqueTokens.size < 3) {
        // Reduced penalty for limited token diversity
        score -= 5; // Reduced from -6 to -5
        metrics.riskFlags.push("Limited token diversity - basic DeFi usage");
      }
    }

    // Enhanced analysis with balance history
    if (enhancedData.balanceHistory?.items?.length > 1) {
      const balanceChanges = enhancedData.balanceHistory.items;
      let volatilityScore = 0;

      for (let i = 1; i < balanceChanges.length; i++) {
        const current = parseFloat(balanceChanges[i].value || 0);
        const previous = parseFloat(balanceChanges[i - 1].value || 0);

        if (previous > 0) {
          const changeRatio = Math.abs((current - previous) / previous);
          volatilityScore += changeRatio;
        }
      }

      // Moderately strict balance stability requirements
      const avgVolatility = volatilityScore / (balanceChanges.length - 1);
      if (avgVolatility < 0.08) {
        // Slightly relaxed threshold from 0.05 to 0.08
        metrics.balanceStability = 15;
        score += 15; // Increased reward
        metrics.merits.push("Excellent balance stability");
      } else if (avgVolatility < 0.2) {
        // Slightly relaxed range
        metrics.balanceStability = 8;
        score += 8; // Increased reward
        metrics.merits.push("Good balance stability");
      } else if (avgVolatility > 0.5) {
        // Reduced penalty for high volatility
        score -= 6; // Reduced from -8 to -6
        metrics.riskFlags.push("High balance volatility - risky behavior");
      }
    }

    // Use counters data for additional insights
    if (enhancedData.counters) {
      const { transactions_count, gas_usage_count, validations_count } =
        enhancedData.counters;

      // Bonus for being a validator (if applicable)
      if (validations_count > 0) {
        score += 20;
        metrics.merits.push("Network validator - Contributes to security");
      }

      // Analyze gas efficiency - Moderately strict requirements
      if (transactions_count > 0 && gas_usage_count) {
        const avgGasPerTx = gas_usage_count / transactions_count;
        if (avgGasPerTx < 60000) {
          // Slightly relaxed threshold from 50000 to 60000
          score += 10; // Increased reward
          metrics.merits.push("Highly efficient gas usage");
        } else if (avgGasPerTx < 120000) {
          // Relaxed threshold
          score += 4; // Slightly increased reward
          metrics.merits.push("Efficient gas usage");
        } else if (avgGasPerTx > 300000) {
          // Reduced penalty for wasteful gas usage
          score -= 5; // Reduced from -6 to -5
          metrics.riskFlags.push(
            "Inefficient gas usage - wasteful transactions"
          );
        }
      }
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    return {
      score: Math.round(score),
      grade: this.getGrade(score),
      metrics,
      uniqueContractCount: metrics.uniqueContracts.size,
    };
  }

  static getGrade(score) {
    if (score >= 82) return "A"; // Slightly reduced threshold from 85
    if (score >= 72) return "B"; // Slightly reduced threshold from 75
    if (score >= 62) return "C"; // Slightly reduced threshold from 65
    if (score >= 50) return "D"; // Same threshold
    return "F";
  }

  static getGradeColor(grade) {
    const colors = {
      A: "#10b981", // green
      B: "#3b82f6", // blue
      C: "#f59e0b", // amber
      D: "#ef4444", // red
      F: "#dc2626", // dark red
    };
    return colors[grade] || "#6b7280";
  }

  static getReputationBadge(score) {
    if (score >= 80) {
      return {
        label: "Super Trusted",
        color: "#10b981", // green
        icon: "🛡️",
        description: "Highly trustworthy wallet with excellent reputation"
      };
    } else if (score >= 60) {
      return {
        label: "Trusted",
        color: "#3b82f6", // blue
        icon: "✅",
        description: "Trustworthy wallet with good reputation"
      };
    } else if (score >= 40) {
      return {
        label: "Medium",
        color: "#f59e0b", // amber
        icon: "⚠️",
        description: "Average wallet with moderate reputation"
      };
    } else if (score >= 20) {
      return {
        label: "Low Trust",
        color: "#ef4444", // red
        icon: "🔸",
        description: "Low reputation wallet - exercise caution"
      };
    } else {
      return {
        label: "High Risk",
        color: "#dc2626", // dark red
        icon: "🚨",
        description: "High risk wallet - avoid interactions"
      };
    }
  }

  static formatAddress(address) {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  static formatValue(value, decimals = 4) {
    // Handle null, undefined, or empty values
    if (value === null || value === undefined || value === "") {
      return "0.0000";
    }

    // Convert string values using ethers
    if (typeof value === "string") {
      try {
        value = parseFloat(ethers.formatEther(value));
      } catch (error) {
        console.warn("Error formatting value:", value, error);
        return "0.0000";
      }
    }

    // Ensure we have a valid number
    const numValue = Number(value);
    if (isNaN(numValue)) {
      console.warn("Invalid number value:", value);
      return "0.0000";
    }

    return numValue.toFixed(decimals);
  }

  static formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
  }

  static getDefaultReputation() {
    return {
      score: 30, // Reduced from 50 to match harsh base score
      grade: "D", // Updated to reflect lower score
      metrics: {
        totalVolume: 0,
        transactionCount: 0,
        uniqueContracts: new Set(),
        riskFlags: [
          "Unable to fetch complete wallet data - insufficient information for assessment",
        ],
        merits: [],
        averageTransactionValue: 0,
        diversityScore: 0,
        frequencyScore: 0,
      },
      riskLevel: "high", // Changed from medium to high for unknown wallets
      uniqueContractCount: 0,
    };
  }
}

export default ReputationAnalyzer;
