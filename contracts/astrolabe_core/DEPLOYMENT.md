# AstrolabePay — On-Chain Contract Deployment

## Deployed Testnet Contract Details

| Parameter | Value |
|---|---|
| **Contract ID** | `CCPRAZ5DW774LI5DRLIOII7TDWJRRPJLKWSLH6CDAV5MFLCIPVJDV36K` |
| **WASM Hash** | `1e2609a45aecfce8044d49d9e17c81a127c82ba49d2e238896b9b70128af510d` |
| **Network** | Stellar Testnet (Protocol 22 / Soroban) |
| **Deployer / Fee Sponsor** | `GCBZC5TOFMEZ6WXL5TDXAMKP7J5RIVHKYBMPHOYX6WR55UXBCLASC4DY` |
| **Deploy Transaction** | [`9b7351a5434e40dd1e572662c430bb796c42d8205aa18653b629802856647fe7`](https://stellar.expert/explorer/testnet/tx/9b7351a5434e40dd1e572662c430bb796c42d8205aa18653b629802856647fe7) |
| **Initialize Transaction** | [`70978edf5f8c85621745d680ee56adff2f555a266da1c5a121ef1837a294fe84`](https://stellar.expert/explorer/testnet/tx/70978edf5f8c85621745d680ee56adff2f555a266da1c5a121ef1837a294fe84) |
| **Seed Provider Transaction** | [`990e520cc2c2ef8c7fc8752a5abb77cec5b6b0c9c5fd4dabc4c06232a25d74af`](https://stellar.expert/explorer/testnet/tx/990e520cc2c2ef8c7fc8752a5abb77cec5b6b0c9c5fd4dabc4c06232a25d74af) |
| **Seed Agent Transaction** | [`20a08bc52b9f788ddd812ab3edaa820ea115ecbb0c4ee79a02445288342eb73a`](https://stellar.expert/explorer/testnet/tx/20a08bc52b9f788ddd812ab3edaa820ea115ecbb0c4ee79a02445288342eb73a) |
| **Stellar Expert Explorer** | [View Contract on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCPRAZ5DW774LI5DRLIOII7TDWJRRPJLKWSLH6CDAV5MFLCIPVJDV36K) |

---

## Contract Methods & ABI

### 1. `initialize(env, admin, treasury, sponsor)`
Initializes the AstrolabePay protocol with core administrative keys and fee-bump sponsor account. Extends instance storage TTL.

### 2. `register_agent(env, master, agent, daily_limit_stroops, total_limit_stroops, name)`
Registers an autonomous delegated sub-agent with on-chain daily and lifetime budget caps. Emits `emit_agent_registered`.

### 3. `update_agent_policy(env, master, agent, daily_limit_stroops, total_limit_stroops, active)`
Allows the master key to adjust an agent's daily limit, total lifetime ceiling, or pause/resume agent execution (`active`).

### 4. `settle_agent_payment(env, agent, recipient, token, amount_stroops, nonce, service_id)`
Executes an atomic fee-sponsored micropayment from agent to recipient token balance. Verifies 24-hour timestamp rolling budget rollover (`86,400s`), validates nonce replay protection, stores receipt in persistent storage, and emits `emit_payment_settled`.

### 5. `register_api_provider(env, provider, service_id, name, price_stroops, token, origin_hash)`
Registers an API service endpoint for discovery by autonomous agents. Emits `emit_service_registered`.

### 6. `rate_service_trust(env, rater, service_id, score, receipt_nonce)`
Updates an API provider's reliability rating (1 to 100) based on cryptographic proof of a settled payment receipt (`receipt_nonce`). Enforces single rating per receipt and rejects unverified callers.

### 7. Governance & Upgradeability
- `set_admin(env, current_admin, new_admin)`: Rotates contract admin key with auth checks.
- `upgrade(env, admin, new_wasm_hash)`: Deploys WASM bytecode upgrade to existing contract instance via Soroban `env.deployer()`.

### 8. View & Query Entrypoints
- `get_agent(env, agent) -> AgentRecord`
- `get_service(env, service_id) -> ServiceRecord`
- `get_receipt(env, nonce) -> ReceiptRecord`
- `get_stats(env) -> SystemStats`
- `check_agent_allowance(env, agent, amount_stroops) -> bool`
