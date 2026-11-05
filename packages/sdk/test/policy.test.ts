import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SpendPolicyEngine, PolicyViolationError } from '../src/policy';

describe('SpendPolicyEngine', () => {
  it('should allow spends within daily limit and per-request ceiling', () => {
    const policy = new SpendPolicyEngine({
      dailyBudgetStroops: 100_000_000n, // 10 XLM
      maxAmountPerRequestStroops: 10_000_000n, // 1 XLM
    });

    assert.doesNotThrow(() => {
      policy.validate('https://api.example.com/v1', 5_000_000n, 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC');
    });

    policy.recordSpend(5_000_000n);
    assert.strictEqual(policy.getDailySpent(), 5_000_000n);
  });

  it('should reject requests exceeding per-request cap', () => {
    const policy = new SpendPolicyEngine({
      maxAmountPerRequestStroops: 2_000_000n,
    });

    assert.throws(
      () => {
        policy.validate('https://api.example.com/v1', 5_000_000n, 'TOKEN');
      },
      (err: any) => err instanceof PolicyViolationError && err.rule === 'MAX_AMOUNT_PER_REQUEST'
    );
  });

  it('should reject requests exceeding daily rolling budget', () => {
    const policy = new SpendPolicyEngine({
      dailyBudgetStroops: 10_000_000n,
    });

    policy.recordSpend(8_000_000n);

    assert.throws(
      () => {
        policy.validate('https://api.example.com/v1', 3_000_000n, 'TOKEN');
      },
      (err: any) => err instanceof PolicyViolationError && err.rule === 'DAILY_BUDGET_EXCEEDED'
    );
  });

  it('should enforce allowed host domain patterns', () => {
    const policy = new SpendPolicyEngine({
      allowedHosts: ['*.stellar.network', 'api.trusted.com'],
    });

    assert.doesNotThrow(() => {
      policy.validate('https://proxy.astrolabe.stellar.network/v1', 100n, 'TOKEN');
    });

    assert.throws(
      () => {
        policy.validate('https://untrusted.evil.com/drain', 100n, 'TOKEN');
      },
      (err: any) => err instanceof PolicyViolationError && err.rule === 'UNAUTHORIZED_HOST'
    );
  });
});
