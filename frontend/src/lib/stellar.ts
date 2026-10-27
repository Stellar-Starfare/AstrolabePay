import { Keypair, Horizon, rpc } from '@stellar/stellar-sdk';

export const TESTNET_HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const TESTNET_SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';
export const CONTRACT_ID = 'CCPRAZ5DW774LI5DRLIOII7TDWJRRPJLKWSLH6CDAV5MFLCIPVJDV36K';
export const RELAYER_PUBLIC_KEY = 'GCBZC5TOFMEZ6WXL5TDXAMKP7J5RIVHKYBMPHOYX6WR55UXBCLASC4DY';
export const DEFAULT_DEMO_SECRET = 'SCZEAKU3JHHO6MFEUYVDRD35367FXUP5GPF4DBXSX76DAZFHHTUYMUGG';

export interface TokenBalance {
  asset: string;
  balance: string;
  issuer?: string;
}

export interface AgentAccount {
  id: string;
  name: string;
  publicKey: string;
  secretKey: string;
  dailyBudget: number;
  spentToday: number;
  maxPerCall: number;
  createdAt: number;
  status: 'ACTIVE' | 'PAUSED' | 'DEPLETED';
}

export interface ServiceEndpoint {
  id: string;
  name: string;
  provider: string;
  costPerCall: number;
  asset: string;
  endpointUrl: string;
  description: string;
  trustScore: number;
  totalCalls: number;
  uptime: string;
  p95LatencyMs: number;
}

export const INITIAL_SERVICES: ServiceEndpoint[] = [
  {
    id: 'deepseek_reasoner',
    name: 'DeepSeek R1 Autonomous Reasoning',
    provider: 'GCBZC5TOFMEZ6WXL5TDXAMKP7J5RIVHKYBMPHOYX6WR55UXBCLASC4DY',
    costPerCall: 0.05,
    asset: 'XLM',
    endpointUrl: 'https://proxy.astrolabe.stellar.network/v1/deepseek',
    description: 'Autonomous multi-step CoT mathematical reasoning & tool orchestration engine.',
    trustScore: 99.8,
    totalCalls: 14820,
    uptime: '99.98%',
    p95LatencyMs: 380,
  },
  {
    id: 'stellar_market_oracle',
    name: 'Stellar Soroban Pyth Price Feed',
    provider: 'GDXTESTPROVIDER728JXZP998234857123984712398712349123847',
    costPerCall: 0.01,
    asset: 'XLM',
    endpointUrl: 'https://proxy.astrolabe.stellar.network/v1/oracle/pyth',
    description: 'Sub-second decentralized market pricing for XLM/USD, EURC, and synthetic commodities.',
    trustScore: 99.9,
    totalCalls: 492100,
    uptime: '100.00%',
    p95LatencyMs: 85,
  },
  {
    id: 'web_retrieval_agent',
    name: 'Perplexity Live Grounded Search',
    provider: 'GC6SEARCHPROVIDER89123409123049182309481230948123094812',
    costPerCall: 0.02,
    asset: 'XLM',
    endpointUrl: 'https://proxy.astrolabe.stellar.network/v1/search',
    description: 'Live real-time Web grounding with citation validation and semantic parsing.',
    trustScore: 98.4,
    totalCalls: 86400,
    uptime: '99.75%',
    p95LatencyMs: 420,
  },
  {
    id: 'solidity_verifier',
    name: 'Formal Bytecode Verifier & Audit',
    provider: 'GBKTESTAUDITOR928374918237491823749182374918237491823',
    costPerCall: 0.15,
    asset: 'XLM',
    endpointUrl: 'https://proxy.astrolabe.stellar.network/v1/audit',
    description: 'Static analysis and formal verification for Soroban WASM & EVM smart contracts.',
    trustScore: 99.4,
    totalCalls: 5120,
    uptime: '99.90%',
    p95LatencyMs: 910,
  }
];

export async function fetchAccountBalances(publicKey: string): Promise<TokenBalance[]> {
  try {
    const server = new Horizon.Server(TESTNET_HORIZON_URL);
    const account = await server.loadAccount(publicKey);
    return account.balances.map(b => ({
      asset: b.asset_type === 'native' ? 'XLM' : ('asset_code' in b ? (b.asset_code as string) : 'CUSTOM'),
      balance: parseFloat(b.balance).toFixed(2),
      issuer: 'asset_issuer' in b ? (b.asset_issuer as string) : undefined
    }));
  } catch (err) {
    // If account not funded or offline, return fallback
    return [{ asset: 'XLM', balance: '0.00' }];
  }
}

export async function requestFriendbot(publicKey: string): Promise<boolean> {
  try {
    const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
    return res.ok;
  } catch (err) {
    console.error('Friendbot fund error:', err);
    return false;
  }
}

export function createNewAgentKeypair(name: string, dailyBudget: number, maxPerCall: number): AgentAccount {
  const kp = Keypair.random();
  return {
    id: `agent_${Math.random().toString(36).substring(2, 9)}`,
    name,
    publicKey: kp.publicKey(),
    secretKey: kp.secret(),
    dailyBudget,
    spentToday: 0,
    maxPerCall,
    createdAt: Date.now(),
    status: 'ACTIVE'
  };
}

export function truncateAddress(addr: string, head = 4, tail = 4): string {
  if (!addr) return '';
  if (addr.length <= head + tail) return addr;
  return `${addr.substring(0, head)}...${addr.substring(addr.length - tail)}`;
}
