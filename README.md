# AstrolabePay 🧭⚡

> **The Autonomous Navigational Payment Engine & Edge x402 Reverse Proxy for AI Agents on Stellar Soroban.**

[![Stellar Soroban](https://img.shields.io/badge/Stellar-Soroban_Protocol_22-blue.svg)](https://stellar.org)
[![Rust](https://img.shields.io/badge/Smart_Contract-Rust_WASM-orange.svg)](https://www.rust-lang.org/)
[![TypeScript](https://img.shields.io/badge/SDK-TypeScript_5.4-3178c6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)](LICENSE)
[![CI](https://github.com/Stellar-Starfare/AstrolabePay/actions/workflows/ci.yml/badge.svg)](https://github.com/Stellar-Starfare/AstrolabePay/actions/workflows/ci.yml)
[![Testnet Deployed](https://img.shields.io/badge/Testnet-CCPRAZ5DW7...V36K-brightgreen.svg)](https://stellar.expert/explorer/testnet/contract/CCPRAZ5DW774LI5DRLIOII7TDWJRRPJLKWSLH6CDAV5MFLCIPVJDV36K)

---

## 📑 Table of Contents
- [1. Executive Summary](#1-executive-summary)
- [2. Senior Developer Critical Review: SwyftPay vs AstrolabePay](#2-senior-developer-critical-review-swyftpay-vs-astrolabepay)
- [3. Live Stellar Testnet Deployment](#3-live-stellar-testnet-deployment)
- [4. Core Architectural Innovations](#4-core-architectural-innovations)
- [5. Protocol Sequence Diagram (HTTP 402 Lifecycle)](#5-protocol-sequence-diagram-http-402-lifecycle)
- [6. Monorepo Repository Structure](#6-monorepo-repository-structure)
- [7. Soroban Smart Contract Architecture](#7-soroban-smart-contract-architecture)
- [8. AstrolabePay SDK & AI Agent Tool Adapters](#8-astrolabepay-sdk--ai-agent-tool-adapters)
- [9. Astrolabe Edge Reverse Proxy](#9-astrolabe-edge-reverse-proxy)
- [10. Frontend Dashboard & Live Simulator](#10-frontend-dashboard--live-simulator)
- [11. Vercel Deployment Guide](#11-vercel-deployment-guide)
- [12. Quickstart & Verification](#12-quickstart--verification)
- [13. Contributing & Community Guidelines](#13-contributing--community-guidelines)

---

## 1. Executive Summary

Autonomous AI agents (such as LangChain, AutoGPT, and CrewAI pipelines) require access to paid web services—ranging from high-parameter reasoning LLMs to real-time financial oracles and web search crawlers. Traditional payment rails (credit cards, recurring subscriptions, API keys with pre-paid balances) fail for autonomous sub-agents due to:
1. **Lack of Identity & Credit Limits**: Sub-agents cannot obtain credit cards or manage invoices.
2. **Runaway Execution Loops**: An agent stuck in a recursive reasoning loop can burn thousands of dollars in minutes without hard caps.
3. **Gas Balance Friction**: In traditional crypto networks, an agent needs native gas tokens to pay transaction fees; running out of gas halts the entire pipeline.

**AstrolabePay** solves these fundamental issues on **Stellar Soroban**:
- **HTTP 402 Payment Required Standard**: Transparently intercepts paid endpoints, queries fees, and fulfills micropayments per call.
- **On-Chain Spend Policy Verification**: Daily rolling spend allowances (enforced over 86,400s consensus timestamps) and per-call caps are enforced directly in Soroban smart contracts, guaranteeing tamper-proof budget governance.
- **Native Fee-Bump Relayer Sponsorship**: Sub-agents sign only their intent; the relayer sponsors the Stellar network transaction fee, meaning agents never need gas reserves.
- **Cryptographic Replay Defense**: Nonce hash-locking prevents double-charging and replay attacks across distributed networks.
- **Verified Trust Network**: API provider reputation scoring requires cryptographic proof of settled on-chain payment receipts, eliminating Sybil manipulation.

---

## 2. Senior Developer Critical Review: SwyftPay vs AstrolabePay

### Background
We conducted a comprehensive architectural review of the reference project [`VihaShomikha/SwyftPay`](https://github.com/VihaShomikha/SwyftPay), an early proof-of-concept exploring AI agent payments on Algorand. While the initial concept of combining HTTP 402 with crypto micropayments is commendable, an in-depth senior engineering audit identified critical production bottlenecks:

| Dimension | SwyftPay (Baseline Algorand POC) | AstrolabePay (Production Stellar Soroban) |
|---|---|---|
| **Base Blockchain** | Algorand AVM / PyTeal | **Stellar Soroban (Rust WASM, Protocol 22)** |
| **Gas Fee Sponsorship** | None. Agents must maintain separate ALGO balances to pay transaction fees. | **Native Stellar Fee-Bump Envelopes**. Relayer sponsors 100% of network fees. Zero gas friction. |
| **Spend Governance** | Hardcoded in local JSON files. Easily bypassed if process restarts or crashes. | **On-Chain Soroban Smart Contract**. Immutable daily budget caps (86,400s rolling window) enforced by consensus. |
| **Replay Protection** | Weak timestamp windowing. Susceptible to replay attacks during clock drift. | **Cryptographic Nonce Hash-Locking** + on-chain claim registry preventing duplicate claims. |
| **Trust Rating Integrity** | Unauthenticated user reviews. Susceptible to Sybil attacks. | **Verified Receipt Proof-of-Payment**. Ratings strictly require on-chain settled receipt nonces. |
| **Multi-Agent Scale** | Single monolithic seed phrase. | **Hierarchical Deterministic Sub-Agent Fleet** with isolated keys and individual budget allocations. |
| **AI Tool Primitives** | Manual cURL / generic fetch wrappers. | **Native LangChain Tools**, **OpenAI Function Calling**, and AutoGPT adapters. |
| **Proxy Architecture** | Mock server without streaming or backpressure. | **Fastify Edge Proxy** with chunked streaming and cryptographic Ed25519 receipt verification. |
| **Settlement Currency** | ALGO only. | **XLM, USDC, EURC**, and any custom issued asset on Stellar. |

---

## 3. Live Stellar Testnet Deployment

The Astrolabe Core smart contract has been compiled to WebAssembly, validated with automated Rust integration tests, deployed to the **Stellar Testnet**, and initialized with live service providers:

| Parameter | Value |
|---|---|
| **Network** | Stellar Testnet (Protocol 22 / Soroban) |
| **Contract ID** | `CCPRAZ5DW774LI5DRLIOII7TDWJRRPJLKWSLH6CDAV5MFLCIPVJDV36K` |
| **Contract Address (Hex)** | `1e2609a45aecfce8044d49d9e17c81a127c82ba49d2e238896b9b70128af510d` |
| **Administrator / Relayer** | `GCBZC5TOFMEZ6WXL5TDXAMKP7J5RIVHKYBMPHOYX6WR55UXBCLASC4DY` |
| **Deploy Tx Hash** | [`9b7351a5434e40dd1e572662c430bb796c42d8205aa18653b629802856647fe7`](https://stellar.expert/explorer/testnet/tx/9b7351a5434e40dd1e572662c430bb796c42d8205aa18653b629802856647fe7) |
| **Init Tx Hash** | [`70978edf5f8c85621745d680ee56adff2f555a266da1c5a121ef1837a294fe84`](https://stellar.expert/explorer/testnet/tx/70978edf5f8c85621745d680ee56adff2f555a266da1c5a121ef1837a294fe84) |
| **Seeded Provider Tx** | [`990e520cc2c2ef8c7fc8752a5abb77cec5b6b0c9c5fd4dabc4c06232a25d74af`](https://stellar.expert/explorer/testnet/tx/990e520cc2c2ef8c7fc8752a5abb77cec5b6b0c9c5fd4dabc4c06232a25d74af) |
| **Seeded Agent Tx** | [`20a08bc52b9f788ddd812ab3edaa820ea115ecbb0c4ee79a02445288342eb73a`](https://stellar.expert/explorer/testnet/tx/20a08bc52b9f788ddd812ab3edaa820ea115ecbb0c4ee79a02445288342eb73a) |
| **Stellar Expert Explorer** | [Inspect Live Contract on Stellar.Expert](https://stellar.expert/explorer/testnet/contract/CCPRAZ5DW774LI5DRLIOII7TDWJRRPJLKWSLH6CDAV5MFLCIPVJDV36K) |

---

## 4. Core Architectural Innovations

### 1. Zero-Gas Autonomous Fee Sponsorship (Fee-Bumps)
Autonomous sub-agents run in isolated environments without user interaction. If an agent's gas runs out, it halts permanently. AstrolabePay utilizes **Stellar Protocol Fee-Bump Envelopes**:
1. The AI agent signs the Soroban authorization entry for the payment amount.
2. The **Astrolabe Relayer** wraps the transaction in a fee-bump envelope and pays the network ledger fee in stroops.
3. The transaction is submitted and settled cleanly on-chain without the agent ever needing a gas balance.

### 2. Immutable On-Chain Spend Policy Guard
Unlike local JSON allowances that can be reset or lost upon pod reboot, AstrolabePay stores policy parameters in contract state:
- `daily_limit_stroops`: Maximum expenditure permitted within an 86,400-second rolling consensus window.
- `spent_today_stroops`: Real-time on-chain tally that resets automatically when `current_ledger_time - last_spend_timestamp >= 86,400`.
- `total_limit_stroops`: Lifetime spend ceiling for the delegated sub-agent.

If an autonomous sub-agent enters an infinite recursion loop, the Soroban contract throws `ContractError::DailyLimitExceeded` and halts billing immediately.

### 3. Cryptographic Nonce Idempotency & Replay Protection
Each 402 challenge generates a unique challenge nonce: `nonce = H(agent_id || service_id || timestamp || salt)`. When the payment settles, the contract records the hash in `Receipt(nonce)`. Any attempt to replay an old transaction returns `ContractError::DuplicateNonce`.

---

## 5. Protocol Sequence Diagram (HTTP 402 Lifecycle)

```mermaid
sequenceDiagram
    autonumber
    actor Agent as Autonomous AI Agent
    participant SDK as Astrolabe SDK & Policy
    participant Proxy as Astrolabe Edge Proxy
    participant Relayer as Fee-Bump Relayer
    participant Soroban as Astrolabe Core Contract
    participant Upstream as Upstream AI Model / API

    Agent->>Proxy: POST /v1/deepseek { prompt: "..." }
    Proxy-->>SDK: HTTP 402 Payment Required (Challenge Nonce & Cost)
    SDK->>SDK: Verify Local Policy Guard (dailyBudget & maxPerCall)
    SDK->>Relayer: Request Fee-Bump Wrap (Agent Signed Auth)
    Relayer->>Soroban: Submit SettleAgentPayment(agent, recipient, token, amount, nonce, serviceId)
    Soroban->>Soroban: Check Allowance & Update spent_today (86,400s rolling window)
    Soroban-->>Relayer: Tx Confirmed (Emits PaymentSettled Event)
    Relayer-->>SDK: Return Tx Hash & Receipt
    SDK->>Proxy: Retry POST with X-Stellar-Payment
    Proxy->>Soroban: Verify On-Chain Receipt (get_receipt) & Tx Status
    Proxy->>Upstream: Forward Verified Request
    Upstream-->>Proxy: Stream Inference Tokens (SSE / Chunked)
    Proxy-->>Agent: 200 OK + Data Stream + Signed Receipt Header
```

---

## 6. Monorepo Repository Structure

```
AstrolabePay/
├── contracts/
│   └── astrolabe_core/          # Soroban Smart Contract (Rust)
│       ├── src/
│       │   ├── lib.rs           # Core contract entrypoints & business logic
│       │   ├── types.rs         # Storage keys, structs, and data types
│       │   ├── errors.rs        # ContractError enum taxonomy
│       │   ├── events.rs        # Telemetry event emitters
│       │   └── test.rs          # Unit & integration tests (100% passing)
│       └── Cargo.toml           # Soroban SDK v21 / Rust workspace
├── packages/
│   ├── sdk/                     # Autonomous AI Agent Client SDK
│   │   ├── src/
│   │   │   ├── client.ts        # AstrolabeClient with 402 interception & on-chain allowance sync
│   │   │   ├── policy.ts        # SpendPolicyEngine (daily limits & allowlists)
│   │   │   ├── agent-wallet.ts  # Hierarchical agent key derivation
│   │   │   ├── relayer.ts       # Secure fee-sponsored fee-bump relayer client
│   │   │   ├── trust.ts         # Provider SLA and uptime scoring
│   │   │   ├── retry.ts         # Exponential backoff with payment-loop guard
│   │   │   ├── adapters.ts      # createAstrolabeLangChainTool & createAstrolabeOpenAITool
│   │   │   └── types.ts         # TypeScript interfaces & challenge schemas
│   │   ├── test/                # Unit test suite for policy, wallet, and adapters
│   │   └── package.json
│   ├── proxy/                   # Astrolabe Edge Reverse Proxy
│   │   ├── src/
│   │   │   ├── server.ts        # Fastify server with rate limiting & dynamic routing
│   │   │   ├── interceptor.ts   # HTTP 402 Challenge generator
│   │   │   ├── verifier.ts      # On-chain Soroban payment verifier with receipt checks
│   │   │   └── forwarder.ts     # Chunked token streaming & Ed25519 signed receipts
│   │   └── package.json
│   └── cli/                     # Developer Terminal CLI
│       ├── src/bin.ts           # balance, fetch, agent:create, serve commands
│       └── package.json
├── frontend/                    # Celestial Cyber React 18 + Vite Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx       # Live testnet status badge & wallet connect
│   │   │   ├── AgentSimulator.tsx # Real-time 402 payment execution playground with Soroban RPC
│   │   │   ├── AgentManager.tsx # Sub-agent keypair and spend policy manager
│   │   │   ├── ProviderRegistry.tsx # Paid service marketplace & trust ratings
│   │   │   ├── CodeSnippets.tsx # Synchronized multi-framework SDK code generator
│   │   │   ├── ArchitectureView.tsx # SwyftPay vs AstrolabePay comparison
│   │   │   ├── WalletModal.tsx  # Keypair manager & Freighter wallet connect
│   │   │   └── FaucetModal.tsx  # 1-click Friendbot 10,000 XLM faucet
│   │   ├── lib/stellar.ts       # Horizon & Soroban RPC helper functions
│   │   ├── index.css            # Celestial cyber design system & Orbitron fonts
│   │   ├── App.tsx              # Main dashboard view with metrics bar
│   │   └── main.tsx
│   ├── index.html
│   └── package.json
├── .github/
│   ├── workflows/               # CI/CD automated test & build workflows
│   ├── ISSUE_TEMPLATE/          # Structured issue templates for contributors
│   └── PULL_REQUEST_TEMPLATE.md # Contributor PR checklist
├── scripts/
│   ├── build-contracts.sh       # POSIX cross-platform build script
│   ├── deploy-contracts.sh      # POSIX cross-platform deploy script
│   ├── build-contracts.ps1      # PowerShell build script
│   └── deploy-contracts.ps1     # PowerShell deploy script
├── Makefile                     # Contributor task runner (make build, make test, etc.)
├── LICENSE                      # Official Apache-2.0 License
├── CONTRIBUTING.md              # Contributor onboarding & PR guidelines
├── CODE_OF_CONDUCT.md           # Contributor Covenant v2.1
├── SECURITY.md                  # Responsible vulnerability disclosure policy
├── package.json                 # Monorepo workspaces manifest
└── README.md                    # Master documentation
```

---

## 7. Soroban Smart Contract Architecture

The core contract (`contracts/astrolabe_core`) is written in Rust targeting WebAssembly.

### Public ABI Methods
```rust
pub trait AstrolabeContractTrait {
    fn initialize(env: Env, admin: Address, treasury: Address, sponsor: Address) -> Result<(), ContractError>;
    fn register_agent(env: Env, master: Address, agent: Address, daily_limit_stroops: i128, total_limit_stroops: i128, name: Symbol) -> Result<(), ContractError>;
    fn update_agent_policy(env: Env, master: Address, agent: Address, daily_limit_stroops: i128, total_limit_stroops: i128, active: bool) -> Result<(), ContractError>;
    fn settle_agent_payment(env: Env, agent: Address, recipient: Address, token: Address, amount_stroops: i128, nonce: BytesN<32>, service_id: Symbol) -> Result<ReceiptRecord, ContractError>;
    fn register_api_provider(env: Env, provider: Address, service_id: Symbol, name: String, price_stroops: i128, token: Address, origin_hash: BytesN<32>) -> Result<(), ContractError>;
    fn rate_service_trust(env: Env, rater: Address, service_id: Symbol, score: u32, receipt_nonce: BytesN<32>) -> Result<u32, ContractError>;
    fn set_admin(env: Env, current_admin: Address, new_admin: Address) -> Result<(), ContractError>;
    fn upgrade(env: Env, admin: Address, new_wasm_hash: BytesN<32>) -> Result<(), ContractError>;
    fn get_agent(env: Env, agent: Address) -> Result<AgentRecord, ContractError>;
    fn get_service(env: Env, service_id: Symbol) -> Result<ServiceRecord, ContractError>;
    fn get_receipt(env: Env, nonce: BytesN<32>) -> Result<ReceiptRecord, ContractError>;
    fn get_stats(env: Env) -> SystemStats;
    fn check_agent_allowance(env: Env, agent: Address, amount_stroops: i128) -> bool;
}
```

### Passing Test Suite
```bash
$ cargo test --manifest-path contracts/astrolabe_core/Cargo.toml
running 6 tests
test test::test_initialization ... ok
test test::test_admin_governance ... ok
test test::test_agent_registration_and_policy ... ok
test test::test_service_registration_and_verified_trust_rating ... ok
test test::test_settle_payment_and_replay_protection ... ok
test test::test_timestamp_daily_spend_rollover ... ok

test result: ok. 6 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.34s
```

---

## 8. AstrolabePay SDK & AI Agent Tool Adapters

### 1. LangChain Integration
Drop-in integration for autonomous ReAct agents:

```typescript
import { createAstrolabeLangChainTool, AstrolabeClient } from '@astrolabe/sdk';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { ChatOpenAI } from '@langchain/openai';

const client = new AstrolabeClient({
  network: 'testnet',
  contractId: 'CCPRAZ5DW774LI5DRLIOII7TDWJRRPJLKWSLH6CDAV5MFLCIPVJDV36K',
  agentSecretKey: process.env.STELLAR_AGENT_SECRET!,
  policy: {
    dailyBudgetStroops: 500_000_000n, // 50 XLM
    maxAmountPerRequestStroops: 5_000_000n // 0.50 XLM
  }
});

const reasoningTool = createAstrolabeLangChainTool(client, {
  name: 'deepseek_reasoner',
  description: 'Paid mathematical and cryptographic reasoning engine (0.05 XLM/call)',
  endpoint: 'https://proxy.astrolabe.stellar.network/v1/deepseek'
});

const model = new ChatOpenAI({ modelName: 'gpt-4o', temperature: 0 });
const executor = await initializeAgentExecutorWithOptions([reasoningTool], model, {
  agentType: 'structured-chat-zero-shot-react-description'
});

const response = await executor.run('Synthesize optimal AMM arbitrage routes on Stellar.');
```

### 2. OpenAI Function Calling Adapter
```typescript
import { createAstrolabeOpenAITool, AstrolabeClient } from '@astrolabe/sdk';
import OpenAI from 'openai';

const client = new AstrolabeClient({
  contractId: 'CCPRAZ5DW774LI5DRLIOII7TDWJRRPJLKWSLH6CDAV5MFLCIPVJDV36K',
  agentSecretKey: process.env.STELLAR_AGENT_SECRET!
});

const oracleTool = createAstrolabeOpenAITool(client, {
  name: 'stellar_market_oracle',
  description: 'Fetches real-time Stellar DEX market prices (0.01 XLM/call)',
  endpoint: 'https://proxy.astrolabe.stellar.network/v1/oracle/pyth'
});

const openai = new OpenAI();
const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'What is the current XLM/USDC spread?' }],
  tools: [oracleTool.definition]
});
```

---

## 9. Astrolabe Edge Reverse Proxy

The Astrolabe Edge Proxy (`packages/proxy`) wraps proprietary AI microservices and enforces payment:
- **HTTP 402 Generation**: Returns standardized challenge payloads containing cost, asset code, payee address, and cryptographic nonce.
- **On-Chain Settlement Verification**: Queries Soroban RPC nodes to verify `get_receipt` and transaction finality before releasing upstream data.
- **Chunked Token Streaming**: Supports real-time LLM token streams without buffering delays.
- **Cryptographic Ed25519 Receipt Injection**: Emits signed `X-Astrolabe-Receipt-Signature` headers for verifiable accounting.

---

## 10. Frontend Dashboard & Live Simulator

The React 18 + Vite frontend provides an interactive control center for autonomous AI agent finances:
1. **Live Agent 402 Simulator**: Trigger AI reasoning calls, inspect HTTP 402 challenges, observe fee-bump sponsorship in real time with live Soroban RPC telemetry, and view on-chain settlement receipts.
2. **Sub-Agent Fleet Manager**: Provision cryptographic keypairs for sub-agents, allocate daily XLM spend limits, and monitor remaining allowances.
3. **API Provider Registry**: Browse registered paid endpoints, inspect SLA uptime, trust scores, and register new API services.
4. **Interactive Code Generator**: Instant code examples for TypeScript, LangChain, OpenAI Tools, Python Requests, and raw cURL.
5. **Architectural Review Matrix**: Side-by-side engineering teardown comparing SwyftPay vs AstrolabePay.

---

## 11. Vercel Deployment Guide

AstrolabePay is optimized for deployment to Vercel:

1. Import the repository into your Vercel account: `https://github.com/Stellar-Starfare/AstrolabePay`.
2. Select **Vite** as the framework preset and set the **Root Directory** to `frontend`.
3. Set build configuration:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set optional environment variables:
   - `VITE_CONTRACT_ID`: `CCPRAZ5DW774LI5DRLIOII7TDWJRRPJLKWSLH6CDAV5MFLCIPVJDV36K`
   - `VITE_STELLAR_NETWORK`: `TESTNET`
5. Click **Deploy**. Full instructions are available in [DEPLOYMENT_VERCEL.md](DEPLOYMENT_VERCEL.md).

---

## 12. Quickstart & Verification

### Prerequisites
- Node.js >= 20
- Rust >= 1.78
- Stellar CLI >= 22.0 (`cargo install --locked stellar-cli`)

### Build & Test Contracts
```bash
# Build WebAssembly contract
npm run build:contracts

# Run integration tests (100% passing)
npm run test:contracts
```

### Run Frontend Locally
```bash
npm run dev:frontend
# Open http://localhost:5173
```

---

## 13. Contributing & Community Guidelines

We welcome pull requests and issue contributions from the open-source community!

- Review our [Contributing Guide](CONTRIBUTING.md) for local development instructions and PR workflows.
- Review our [Code of Conduct](CODE_OF_CONDUCT.md).
- To report security vulnerabilities, consult our [Security Policy](SECURITY.md).

---

## 📜 License
Apache-2.0 License. Built with precision for the Stellar Ecosystem by **Stellar Starfare** (`quencymoriel1`).
