# Security Policy

AstrolabePay secures decentralized payment rails and autonomous transaction signing for AI agents on Stellar Soroban. We take the security of our smart contracts, cryptographic adapters, and reverse proxy infrastructure seriously.

---

## Supported Versions

Only the latest release and the current `main` branch receive active security updates:

| Version | Supported |
|---|:---:|
| 1.x / `main` | :white_check_mark: |
| < 1.0.0 | :x: |

---

## Reporting a Vulnerability

If you discover a security vulnerability within **AstrolabePay**, please **do not open a public issue or discuss it in public chat channels**.

### Responsible Disclosure Steps

1. Email your report directly to **`security@astrolabe.network`** or open a [GitHub Private Vulnerability Report](https://github.com/Stellar-Starfare/AstrolabePay/security/advisories/new).
2. Include the following details:
   - Component affected (`contracts/astrolabe_core`, `packages/proxy`, `packages/sdk`, etc.)
   - Description of the potential vulnerability and threat model
   - Step-by-step reproduction or proof of concept (PoC)
   - Suggested remediation or patch if known
3. Our core security team will acknowledge receipt within **24 hours** and provide regular progress updates.
4. We ask that you maintain confidentiality until we have had an opportunity to review, patch, and release an update.

---

## Threat Model & Security Scope

Our core threat model covers:
- **Smart Contracts**: Unauthorized fund drainage, daily spend policy bypasses, replay nonce reuse, integer overflow/underflow, unverified trust ratings, and storage exhaustion.
- **Reverse Proxy**: Authentication bypass, invalid settlement verification, unhandled race conditions, and denial of service.
- **Client SDK & Relayer**: Private key leakage, insecure defaults, and transaction replay vulnerabilities.
