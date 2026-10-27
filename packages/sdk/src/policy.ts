import { SpendPolicy } from './types';

export class PolicyViolationError extends Error {
  constructor(message: string, public readonly rule: string) {
    super(`SpendPolicy Violation [${rule}]: ${message}`);
    this.name = 'PolicyViolationError';
  }
}

export class SpendPolicyEngine {
  private dailySpentStroops: bigint = 0n;
  private lastResetTime: number = Date.now();

  constructor(private policy: SpendPolicy = {}) {}

  getDailySpent(): bigint {
    this.checkDailyRollover();
    return this.dailySpentStroops;
  }

  private checkDailyRollover(): void {
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (Date.now() - this.lastResetTime >= oneDayMs) {
      this.dailySpentStroops = 0n;
      this.lastResetTime = Date.now();
    }
  }

  validate(url: string, amountStroops: bigint, tokenAddress: string): void {
    this.checkDailyRollover();

    // 1. Max amount per request
    if (
      this.policy.maxAmountPerRequestStroops !== undefined &&
      amountStroops > this.policy.maxAmountPerRequestStroops
    ) {
      throw new PolicyViolationError(
        `Amount ${amountStroops} stroops exceeds per-request cap of ${this.policy.maxAmountPerRequestStroops}`,
        'MAX_AMOUNT_PER_REQUEST'
      );
    }

    // 2. Daily budget
    if (
      this.policy.dailyBudgetStroops !== undefined &&
      this.dailySpentStroops + amountStroops > this.policy.dailyBudgetStroops
    ) {
      throw new PolicyViolationError(
        `Daily spend ${this.dailySpentStroops + amountStroops} stroops exceeds daily budget of ${this.policy.dailyBudgetStroops}`,
        'DAILY_BUDGET_EXCEEDED'
      );
    }

    // 3. Allowed hosts
    if (this.policy.allowedHosts && this.policy.allowedHosts.length > 0) {
      const parsedUrl = new URL(url);
      const host = parsedUrl.hostname;
      const matched = this.policy.allowedHosts.some((pattern) => {
        if (pattern.startsWith('*.')) {
          return host.endsWith(pattern.slice(2)) || host === pattern.slice(2);
        }
        return host === pattern;
      });

      if (!matched) {
        throw new PolicyViolationError(
          `Host '${host}' is not in allowed hosts: ${this.policy.allowedHosts.join(', ')}`,
          'UNAUTHORIZED_HOST'
        );
      }
    }

    // 4. Allowed tokens
    if (this.policy.allowedTokens && this.policy.allowedTokens.length > 0) {
      const isAllowed = this.policy.allowedTokens.some(
        (t) => t.toUpperCase() === tokenAddress.toUpperCase()
      );
      if (!isAllowed) {
        throw new PolicyViolationError(
          `Token '${tokenAddress}' is not authorized`,
          'UNAUTHORIZED_TOKEN'
        );
      }
    }
  }

  recordSpend(amountStroops: bigint): void {
    this.dailySpentStroops += amountStroops;
  }
}
