# 🛡️ Wallet Warden - Web3 Reputation Tracker

A lightweight frontend application that analyzes Web3 wallet reputation using the Blockscout API. Track wallet activity, assess behavioral patterns, and identify potential risks in the Ethereum ecosystem.

## 🌟 Features

### 🪪 Wallet Identity & Overview

- **ENS Resolution**: Display ENS names when available
- **Balance Tracking**: Real-time ETH balance
- **Token Holdings**: Complete token portfolio analysis
- **Transaction Count**: Total transaction history

### 🧾 Transaction Analysis

- **Recent Activity**: Last 20 transactions with detailed breakdown
- **Visual Charts**: Interactive transaction volume and frequency graphs
- **Contract Interaction**: Identify smart contract interactions
- **Risk Assessment**: Flag interactions with known risky contracts

### 📊 Reputation Scoring

- **Smart Algorithm**: Multi-factor reputation scoring (0-100)
- **Behavioral Metrics**:
  - Total transaction volume
  - Contract interaction diversity
  - Transaction frequency patterns
  - Token holding diversity
- **Risk Flags**: Identify potential red flags
- **Merit Badges**: Recognize positive behaviors

### 🔧 Risk Detection

- **Mixer Detection**: Flag interactions with known privacy mixers
- **Scam Contract Detection**: Identify interactions with flagged contracts
- **Bot Activity Detection**: Recognize potential automated trading patterns
- **High-Frequency Trading Alerts**: Flag unusual transaction patterns

### 🎖️ Merit System

- **Verified Contract Interactions**: Bonus for interacting with verified contracts
- **Token Diversity**: Rewards for holding multiple token types
- **Consistent Activity**: Recognition for sustained, healthy activity patterns

## 🚀 Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Modern CSS with custom variables
- **Charts**: Chart.js with react-chartjs-2
- **API Integration**: Blockscout API v2
- **Icons**: Lucide React
- **Utilities**: Ethers.js for address validation

## 🛠️ Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd wallet-warden
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Blockscout API Setup

The application is pre-configured to use Ethereum mainnet. To use a different network:

1. Update the `BLOCKSCOUT_BASE_URL` in `src/services/blockscoutApi.js`
2. Supported networks include:
   - Ethereum Mainnet: `https://eth.blockscout.com/api/v2`
   - Ethereum Sepolia: `https://eth-sepolia.blockscout.com/api/v2`
   - Optimism Sepolia: `https://optimism-sepolia.blockscout.com/api/v2`
   - Polygon: `https://polygon.blockscout.com/api/v2`

### Risk Contract Database

Customize risk assessment by updating the contract lists in `src/utils/reputationAnalyzer.js`:

```javascript
const RISKY_CONTRACTS = new Set([
  "0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2b63", // Tornado Cash
  // Add more risky contract addresses
]);

const VERIFIED_CONTRACTS = new Set([
  "0xa0b86a33e6c741a05a2a2c9b823c72bf23a46104", // Uniswap
  // Add more verified contract addresses
]);
```

## 📱 Usage

### Basic Wallet Analysis

1. **Enter Wallet Address**: Input any valid Ethereum address
2. **Quick Examples**: Use provided example addresses for testing
3. **View Results**: Comprehensive reputation report with visualizations

### Understanding Reputation Scores

| Grade | Score Range | Description                          |
| ----- | ----------- | ------------------------------------ |
| **A** | 80-100      | Excellent reputation, trusted wallet |
| **B** | 70-79       | Good reputation, active participant  |
| **C** | 60-69       | Average reputation, normal activity  |
| **D** | 50-59       | Below average, some concerns         |
| **F** | 0-49        | Poor reputation, high risk           |

### Reputation Factors

- ✅ **Positive Factors**:

  - Verified contract interactions (+5 points each)
  - Token holding diversity (+2 points per token, max 15)
  - Healthy transaction frequency (+10 points max)
  - Maintaining ETH balance (+10 points max)

- ❌ **Negative Factors**:
  - Risky contract interactions (-15 points each)
  - Excessive transaction frequency (-5 points)
  - Suspicious activity patterns (variable penalty)

## 🔍 API Integration

### Blockscout API Endpoints Used

| Endpoint                                     | Purpose             | Data Retrieved                       |
| -------------------------------------------- | ------------------- | ------------------------------------ |
| `/addresses/{address}`                       | Wallet Info         | Balance, ENS, transaction count      |
| `/addresses/{address}/transactions`          | Transaction History | Recent transactions, methods, values |
| `/addresses/{address}/tokens`                | Token Holdings      | ERC-20/721 tokens, balances          |
| `/addresses/{address}/internal-transactions` | Internal Txs        | Contract interactions                |

### Rate Limiting

The application implements automatic retry logic and respects Blockscout's rate limits. For production use, consider:

- Implementing request caching
- Adding API key authentication
- Using request queuing for bulk analysis

## 🎨 UI Components

### Component Architecture

```
App.jsx (Main container)
├── WalletSearch.jsx (Address input & validation)
├── WalletOverview.jsx (Reputation score & stats)
├── TransactionHistory.jsx (Transaction list)
├── TransactionChart.jsx (Visual analytics)
└── TokenHoldings.jsx (Token portfolio)
```

### Responsive Design

- **Desktop**: Two-column layout with charts and detailed views
- **Tablet**: Stacked layout with optimized spacing
- **Mobile**: Single-column layout with touch-friendly interactions

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deployment Options

1. **Vercel** (Recommended)

   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Netlify**

   - Connect your repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

3. **GitHub Pages**
   ```bash
   npm run build
   npm run gh-pages
   ```

## 🔐 Security Considerations

- **No Private Keys**: Application only analyzes public blockchain data
- **Read-Only Access**: No wallet connection or transaction signing
- **Privacy Focused**: No user data collection or storage
- **HTTPS Required**: Secure connections for API calls

---
