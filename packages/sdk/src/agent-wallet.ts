import crypto from 'crypto';
import { Keypair } from '@stellar/stellar-sdk';
import { AgentBudgetConfig, AgentRecord } from './types';
import { SpendPolicyEngine } from './policy';

export class AgentWalletManager {
  private masterSecret: string;
  private agents: Map<string, AgentRecord> = new Map();
  private policies: Map<string, SpendPolicyEngine> = new Map();

  constructor(masterSecret: string) {
    this.masterSecret = masterSecret;
  }

  /**
   * Deterministically derives a unique Stellar keypair for an agent from master secret and agentId
   */
  deriveAgentKeypair(agentId: string): Keypair {
    const rawKey = crypto
      .createHmac('sha256', this.masterSecret)
      .update(`astrolabe:agent:${agentId}`)
      .digest();
    return Keypair.fromRawEd25519Seed(rawKey);
  }

  createAgent(agentId: string, name: string, budget: AgentBudgetConfig): AgentRecord {
    const keypair = this.deriveAgentKeypair(agentId);
    const record: AgentRecord = {
      id: agentId,
      name,
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
      dailyLimitStroops: budget.dailyLimitStroops,
      totalLimitStroops: budget.totalLimitStroops,
      spentTodayStroops: 0n,
      spentTotalStroops: 0n,
      createdAt: Date.now(),
    };

    this.agents.set(agentId, record);
    this.policies.set(
      agentId,
      new SpendPolicyEngine({
        dailyBudgetStroops: budget.dailyLimitStroops,
        maxAmountPerRequestStroops: budget.dailyLimitStroops / 2n,
      })
    );

    return record;
  }

  getAgent(agentId: string): AgentRecord | undefined {
    return this.agents.get(agentId);
  }

  listAgents(): AgentRecord[] {
    return Array.from(this.agents.values());
  }

  getPolicy(agentId: string): SpendPolicyEngine | undefined {
    return this.policies.get(agentId);
  }

  recordAgentSpend(agentId: string, amountStroops: bigint): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.spentTodayStroops += amountStroops;
      agent.spentTotalStroops += amountStroops;
      const pol = this.policies.get(agentId);
      if (pol) pol.recordSpend(amountStroops);
    }
  }
}
