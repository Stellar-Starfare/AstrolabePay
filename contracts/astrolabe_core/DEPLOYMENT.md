# AstrolabePay — On-Chain Contract Deployment

## Deployed Testnet Contract Details

| Parameter | Value |
|---|---|
| **Contract ID** | `CCPRAZ5DW774LI5DRLIOII7TDWJRRPJLKWSLH6CDAV5MFLCIPVJDV36K` |
| **WASM Hash** | `1e2609a45aecfce8044d49d9e17c81a127c82ba49d2e238896b9b70128af510d` |
| **Network** | Stellar Testnet (Protocol 29/30) |
| **Deployer / Fee Sponsor** | `GCBZC5TOFMEZ6WXL5TDXAMKP7J5RIVHKYBMPHOYX6WR55UXBCLASC4DY` |
| **Deploy Transaction** | [`9b7351a5434e40dd1e572662c430bb796c42d8205aa18653b629802856647fe7`](https://stellar.expert/explorer/testnet/tx/9b7351a5434e40dd1e572662c430bb796c42d8205aa18653b629802856647fe7) |
| **Initialize Transaction** | [`70978edf5f8c85621745d680ee56adff2f555a266da1c5a121ef1837a294fe84`](https://stellar.expert/explorer/testnet/tx/70978edf5f8c85621745d680ee56adff2f555a266da1c5a121ef1837a294fe84) |
| **Seed Provider Transaction** | [`990e520cc2c2ef8c7fc8752a5abb77cec5b6b0c9c5fd4dabc4c06232a25d74af`](https://stellar.expert/explorer/testnet/tx/990e520cc2c2ef8c7fc8752a5abb77cec5b6b0c9c5fd4dabc4c06232a25d74af) |
| **Seed Agent Transaction** | [`20a08bc52b9f788ddd812ab3edaa820ea115ecbb0c4ee79a02445288342eb73a`](https://stellar.expert/explorer/testnet/tx/20a08bc52b9f788ddd812ab3edaa820ea115ecbb0c4ee79a02445288342eb73a) |
| **Stellar Expert Explorer** | [View Contract on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCPRAZ5DW774LI5DRLIOII7TDWJRRPJLKWSLH6CDAV5MFLCIPVJDV36K) |

---

## Contract Methods & ABI

### 1. `initialize(admin, treasury, sponsor)`
Initializes the AstrolabePay protocol with core administrative keys.

### 2. `register_agent(master, agent, daily_limit_stroops, total_limit_stroops, name)`
Registers an autonomous delegated agent key with on-chain cryptographic limits.

### 3. `settle_agent_payment(agent, recipient, token, amount_stroops, nonce, service_id)`
Executes an on-chain fee-sponsored payment from agent to recipient while verifying daily allowance and checking for replay nonces.

### 4. `register_api_provider(provider, service_id, name, price_stroops, token, origin_hash)`
Registers an API service endpoint for discovery by autonomous agents.

### 5. `rate_service_trust(rater, service_id, score)`
Updates an API provider's reliability rating (1 to 100) based on verified agent invocations.
