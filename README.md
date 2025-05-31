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

- REST API for wallet and transaction data
- Real-time blockchain analytics
- Contract verification checking
- Custom reputation scoring algorithm

Built for ETH Prague 2024 - Blockscout bounties.
