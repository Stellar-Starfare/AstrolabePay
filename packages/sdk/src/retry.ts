export class PaymentLoopError extends Error {
  constructor(public readonly url: string, public readonly paymentAttempts: number) {
    super(`Payment loop detected: Endpoint ${url} challenged for payment ${paymentAttempts} times consecutively without resolving.`);
    this.name = 'PaymentLoopError';
  }
}

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  backoffFactor?: number;
  maxPaymentAttemptsPerUrl?: number;
}

export class RetryGuard {
  private paymentAttempts: Map<string, number> = new Map();

  constructor(private options: RetryOptions = {}) {}

  recordPaymentAttempt(url: string): void {
    const maxAttempts = this.options.maxPaymentAttemptsPerUrl || 2;
    const current = (this.paymentAttempts.get(url) || 0) + 1;
    if (current > maxAttempts) {
      throw new PaymentLoopError(url, current);
    }
    this.paymentAttempts.set(url, current);
  }

  clearAttempts(url: string): void {
    this.paymentAttempts.delete(url);
  }

  async executeWithBackoff<T>(fn: () => Promise<T>): Promise<T> {
    const maxRetries = this.options.maxRetries ?? 3;
    let delay = this.options.initialDelayMs ?? 500;
    const factor = this.options.backoffFactor ?? 2;

    let lastError: any;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err: any) {
        lastError = err;
        if (err.name === 'PaymentLoopError' || err.name === 'PolicyViolationError') {
          throw err;
        }
        if (attempt === maxRetries) break;
        await new Promise((r) => setTimeout(r, delay));
        delay *= factor;
      }
    }
    throw lastError;
  }
}
