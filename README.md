# 🛡️ Wallet Warden

A Web3 wallet reputation tracker that analyzes Ethereum addresses using Blockscout APIs. Built for ETH Prague 2024 hackathon.

## ⚡ Quick Start

```bash
git clone <your-repo-url>
cd wallet-warden
npm install
npm run dev
```

Open http://localhost:5173

## 🌟 Features

- **Wallet Reputation Scoring** - 0-100 score based on transaction patterns
- **Transaction Analysis** - Visual charts and detailed transaction history
- **Token Holdings** - Complete portfolio overview
- **Risk Detection** - Flags interactions with risky contracts
- **Real-time Data** - Powered by Blockscout API

## 🛠️ Tech Stack

- React 18 + Vite
- Chart.js for visualizations
- Blockscout API v2
- Responsive CSS

## 🚀 Deployment

**Vercel (Recommended):**

```bash
npm run build
npx vercel --prod
```

**Netlify:**

- Build command: `npm run build`
- Publish directory: `dist`

## 🏆 Hackathon Integration

This project integrates **Blockscout** in multiple ways:

- **Comprehensive REST API Usage** - 8+ endpoints for deep blockchain analysis:

  - `/addresses/{address}` - Wallet information and ENS resolution
  - `/addresses/{address}/transactions` - Transaction history analysis
  - `/addresses/{address}/tokens` - Token portfolio tracking
  - `/addresses/{address}/internal-transactions` - Contract interaction depth
  - `/addresses/{address}/token-transfers` - Token movement patterns
  - `/addresses/{address}/coin-balance-history` - Balance stability analysis
  - `/addresses/{address}/counters` - Network participation metrics
  - `/transactions/{hash}` - Transaction detail analysis

- **Advanced Analytics Engine** - Multi-factor reputation scoring using:

  - Contract verification status checking
  - DeFi interaction sophistication analysis
  - Token portfolio diversity scoring
  - Balance stability and volatility metrics
  - Gas efficiency optimization tracking
  - Network validator participation detection

- **Real-time Blockchain Intelligence** - Live reputation scoring with risk detection
- **Professional Data Visualization** - Interactive charts powered by Blockscout data

Built for **ETH Prague 2024** - Competing for Blockscout's **Best API Use ($6,000)** and **Pool Prize ($10,000)** bounties.
