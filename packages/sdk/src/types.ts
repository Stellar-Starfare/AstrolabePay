export interface AstrolabeX402Challenge {
  x402Version: 2;
  title: string;
  description: string;
  serviceId: string;
  accepts: {
    scheme: 'exact' | 'sponsored';
    network: 'stellar-testnet' | 'stellar-mainnet';
    contractId: string;
    serviceId: string;
    priceStroops: string;
    priceFormatted: string;
    assetCode: string;
    assetContractId: string;
    recipient: string;
    nonce: string;
    sponsorEndpoint?: string;
  }[];
}

export interface SpendPolicy {
  maxAmountPerRequestStroops?: bigint;
  dailyBudgetStroops?: bigint;
  allowedHosts?: string[];
  allowedTokens?: string[];
  autoApproveBelowStroops?: bigint;
}

export interface AstrolabePaymentPayload {
  version: 2;
  agentPublicKey: string;
  serviceId: string;
  nonce: string;
  txHash: string;
  mode: 'fee_sponsored' | 'direct';
  amountStroops: string;
}

export interface AgentBudgetConfig {
  dailyLimitStroops: bigint;
  totalLimitStroops: bigint;
  alertThreshold: number; // e.g. 0.8 for 80%
}

export interface AgentRecord {
  id: string;
  name: string;
  publicKey: string;
  secretKey: string;
  dailyLimitStroops: bigint;
  totalLimitStroops: bigint;
  spentTodayStroops: bigint;
  spentTotalStroops: bigint;
  createdAt: number;
}

export interface PaymentReceipt {
  status: 'settled' | 'cached';
  txHash: string;
  ledger: number;
  agent: string;
  recipient: string;
  serviceId: string;
  amountStroops: string;
  assetCode: string;
  settledAt: string;
}
