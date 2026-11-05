# Contributing to AstrolabePay 🧭⚡

Thank you for your interest in contributing to **AstrolabePay**! We welcome contributions from developers, researchers, and AI engineers across the Web3 and autonomous agent ecosystems.

---

## Code of Conduct

All contributors and maintainers are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior to security@astrolabe.network.

---

## Monorepo Architecture

AstrolabePay is organized as a multi-package monorepo:

- **`contracts/astrolabe_core`**: Soroban smart contract (Rust targeting WASM).
- **`packages/sdk`**: Client SDK for autonomous AI agents (TypeScript).
- **`packages/proxy`**: Fastify edge reverse proxy enforcing HTTP 402 payment challenges.
- **`packages/cli`**: Command-line developer tool for key derivation and autonomous fetching.
- **`frontend`**: React 18 + Vite celestial cyber dashboard and live playground.
- **`scripts`**: Contract build, deployment, and testnet seeding utilities.

---

## Local Development Setup

### Prerequisites

- **Node.js**: >= 20.0.0
- **npm**: >= 10.0.0
- **Rust**: >= 1.78.0
- **Stellar CLI**: >= 22.0.0 (`cargo install --locked stellar-cli`)
- **target wasm32**: `rustup target add wasm32-unknown-unknown`

### Initial Installation

```bash
# Clone the repository
git clone https://github.com/Stellar-Starfare/AstrolabePay.git
cd AstrolabePay

# Install monorepo dependencies
npm install
```

---

## Building & Testing

### Smart Contracts

```bash
# Build WASM bytecode
npm run build:contracts
# Or directly with stellar-cli:
stellar contract build --manifest-path contracts/astrolabe_core/Cargo.toml

# Run Soroban unit and integration tests
npm run test:contracts
# Or directly:
cargo test --manifest-path contracts/astrolabe_core/Cargo.toml
```

### TypeScript Packages & Frontend

```bash
# Build all packages and frontend
npm run build

# Start frontend development server
npm run dev:frontend

# Start Edge Proxy server
npm run start:proxy
```

---

## Branching & Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat(...)`: A new feature or capability
- `fix(...)`: A bug fix or vulnerability patch
- `test(...)`: Adding or refactoring tests
- `docs(...)`: Documentation updates
- `refactor(...)`: Code refactoring without behavioral changes
- `chore(...)`: Tooling, configuration, or dependency updates
- `ci(...)`: GitHub Actions or automation improvements

### Pull Request Workflow

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feat/my-new-feature
   ```
2. Write clean, modular, and documented code.
3. Ensure all tests and type checks pass:
   ```bash
   npm run test:contracts
   npm run build
   ```
4. Commit your changes with conventional messages.
5. Push to your fork and submit a Pull Request to `main`.
6. Link any relevant issue using `Fixes #<issue-number>`.

---

## Reporting Vulnerabilities

Please **do not** open public GitHub issues for security vulnerabilities. Review our [Security Policy](SECURITY.md) for instructions on confidential disclosure.
