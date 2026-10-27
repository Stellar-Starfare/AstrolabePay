# AstrolabePay Vercel Deployment Guide

This guide details how to deploy the **AstrolabePay** autonomous agent dashboard to **Vercel** with continuous deployment from GitHub.

---

## 1. Quick Deploy via Vercel CLI

Ensure you have the Vercel CLI installed and authenticated:

```bash
npm install -g vercel
vercel login
```

### Option A: Deploy from Monorepo Root
The repository includes a root `vercel.json` configured to build the frontend workspace automatically:

```bash
vercel --prod
```

### Option B: Deploy from the `frontend/` Subdirectory
If you prefer deploying only the frontend directory:

```bash
cd frontend
vercel --prod
```

---

## 2. Deploy via Vercel Web Dashboard (Recommended)

1. Navigate to [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and select repository:
   **`https://github.com/Stellar-Starfare/AstrolabePay`**
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

---

## 3. Environment Variables (Optional)

AstrolabePay comes pre-configured with live Stellar Testnet contract defaults. You can override them in Vercel **Settings > Environment Variables**:

| Variable Name | Description | Default Value |
|---|---|---|
| `VITE_STELLAR_NETWORK` | Stellar network target | `TESTNET` |
| `VITE_SOROBAN_RPC_URL` | Soroban JSON-RPC node | `https://soroban-testnet.stellar.org` |
| `VITE_HORIZON_URL` | Stellar Horizon REST API | `https://horizon-testnet.stellar.org` |
| `VITE_CONTRACT_ID` | Astrolabe Core Soroban Contract | `CCPRAZ5DW774LI5DRLIOII7TDWJRRPJLKWSLH6CDAV5MFLCIPVJDV36K` |
| `VITE_RELAYER_PUBLIC_KEY` | Fee-Bump Sponsor Account | `GCBZC5TOFMEZ6WXL5TDXAMKP7J5RIVHKYBMPHOYX6WR55UXBCLASC4DY` |

---

## 4. Live Verification Checklist

Once deployed to your `*.vercel.app` domain:
1. Verify the green **Stellar Testnet Protocol 22** live indicator in the top navbar.
2. Click the **Contract Explorer** pill to verify link to Stellar.Expert:
   `https://stellar.expert/explorer/testnet/contract/CCPRAZ5DW774LI5DRLIOII7TDWJRRPJLKWSLH6CDAV5MFLCIPVJDV36K`
3. Click **Friendbot Faucet** to fund any connected account with 10,000 test XLM.
4. Open the **Agent 402 Simulator** tab and execute an autonomous payment cycle to verify zero-gas fee-bump relaying and live telemetry!
