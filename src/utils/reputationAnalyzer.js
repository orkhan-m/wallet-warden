import { ethers } from "ethers";

// Known contract addresses for risk assessment
const RISKY_CONTRACTS = new Set([
  // Add known mixer/scam contract addresses here
  "0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2b63", // Example Tornado Cash
]);

const VERIFIED_CONTRACTS = new Set([
  // Add known good contract addresses here
  "0xa0b86a33e6c741a05a2a2c9b823c72bf23a46104", // Example Uniswap
  "0x7a250d5630b4cf539739df2c5dacb4c659f2488d", // Example Uniswap Router
]);

export class ReputationAnalyzer {
  static calculateReputation(
    walletData,
    transactions,
    tokens,
    enhancedData = {}
  ) {
    let score = 50; // Base score
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

        transactions.items.forEach((tx) => {
          try {
            // Calculate volume with safe value parsing
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
            metrics.totalVolume += value;

            // Track unique contracts
            if (tx.to && tx.to.is_contract && tx.to.hash) {
              metrics.uniqueContracts.add(tx.to.hash);

              // Check for risky contracts
              if (RISKY_CONTRACTS.has(tx.to.hash.toLowerCase())) {
                metrics.riskFlags.push(
                  `Interaction with risky contract: ${tx.to.hash}`
                );
                score -= 15;
              }

              // Check for verified contracts
              if (
                VERIFIED_CONTRACTS.has(tx.to.hash.toLowerCase()) ||
                tx.to.is_verified
              ) {
                metrics.merits.push(
                  `Interaction with verified contract: ${tx.to.hash}`
                );
                score += 5;
              }
            }
          } catch (txError) {
            console.warn("Error processing transaction:", tx, txError);
          }
        });

        // Calculate average transaction value
        metrics.averageTransactionValue =
          metrics.totalVolume / Math.max(metrics.transactionCount, 1);

        // Diversity score (more unique contracts = better)
        metrics.diversityScore = Math.min(metrics.uniqueContracts.size * 2, 20);
        score += metrics.diversityScore;

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

          if (recentTxs.length > 0 && recentTxs.length < 100) {
            metrics.frequencyScore = Math.min(recentTxs.length, 10);
            score += metrics.frequencyScore;
          } else if (recentTxs.length >= 100) {
            // Too many transactions might indicate bot activity
            score -= 5;
            metrics.riskFlags.push("High frequency trading detected");
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

    // Analyze token holdings
    if (tokens && tokens.items) {
      const tokenCount = tokens.items.length;
      if (tokenCount > 0) {
        score += Math.min(tokenCount * 2, 15); // Bonus for holding tokens
        metrics.merits.push(`Holds ${tokenCount} different tokens`);
      }
    }

    // Analyze wallet balance
    if (walletData && walletData.coin_balance) {
      try {
        const balance = parseFloat(ethers.formatEther(walletData.coin_balance));
        if (!isNaN(balance) && balance > 0.1) {
          score += Math.min(Math.log10(balance) * 5, 10);
          metrics.merits.push(`Maintains balance of ${balance.toFixed(4)} ETH`);
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

      // Bonus for contract interactions (shows sophistication)
      score += Math.min(metrics.contractInteractionDepth * 2, 15);
      if (metrics.contractInteractionDepth > 10) {
        metrics.merits.push("Advanced DeFi user - High contract interaction");
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

      // Bonus for token diversity
      const tokenDiversityBonus = Math.min(uniqueTokens.size * 1.5, 20);
      score += tokenDiversityBonus;

      if (uniqueTokens.size > 5) {
        metrics.merits.push(
          `Diverse token portfolio - ${uniqueTokens.size} different tokens`
        );
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

      // Lower volatility = more stable = higher score
      const avgVolatility = volatilityScore / (balanceChanges.length - 1);
      if (avgVolatility < 0.1) {
        metrics.balanceStability = 10;
        score += 10;
        metrics.merits.push("Stable balance management");
      } else if (avgVolatility < 0.3) {
        metrics.balanceStability = 5;
        score += 5;
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

      // Analyze gas efficiency
      if (transactions_count > 0 && gas_usage_count) {
        const avgGasPerTx = gas_usage_count / transactions_count;
        if (avgGasPerTx < 100000) {
          // Efficient gas usage
          score += 5;
          metrics.merits.push("Efficient gas usage");
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
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
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
      score: 50,
      grade: "C",
      metrics: {
        totalVolume: 0,
        transactionCount: 0,
        uniqueContracts: new Set(),
        riskFlags: ["Unable to fetch complete wallet data"],
        merits: [],
        averageTransactionValue: 0,
        diversityScore: 0,
        frequencyScore: 0,
      },
      riskLevel: "medium",
      uniqueContractCount: 0,
    };
  }
}

export default ReputationAnalyzer;
