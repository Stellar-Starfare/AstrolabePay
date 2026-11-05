import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AgentWalletManager } from '../src/agent-wallet';

describe('AgentWalletManager', () => {
  const masterSecret = 'SCZEAKU3JHHO6MFEUYVDRD35367FXUP5GPF4DBXSX76DAZFHHTUYMUGG';

  it('should deterministically derive distinct keypairs for different agents', () => {
    const manager = new AgentWalletManager(masterSecret);

    const agentA = manager.deriveAgentKeypair('agent_alpha');
    const agentB = manager.deriveAgentKeypair('agent_beta');
    const agentA_again = manager.deriveAgentKeypair('agent_alpha');

    assert.notStrictEqual(agentA.publicKey(), agentB.publicKey());
    assert.strictEqual(agentA.publicKey(), agentA_again.publicKey());
  });

  it('should provision an agent record with isolated spend budget', () => {
    const manager = new AgentWalletManager(masterSecret);

    const record = manager.createAgent('agent_1', 'Trading Bot', {
      dailyLimitStroops: 50_000_000n,
      totalLimitStroops: 500_000_000n,
      alertThreshold: 0.8,
    });

    assert.strictEqual(record.id, 'agent_1');
    assert.strictEqual(record.dailyLimitStroops, 50_000_000n);
    assert.strictEqual(record.spentTodayStroops, 0n);

    manager.recordAgentSpend('agent_1', 10_000_000n);
    assert.strictEqual(manager.getAgent('agent_1')?.spentTodayStroops, 10_000_000n);
  });
});
