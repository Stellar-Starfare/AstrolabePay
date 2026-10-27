import { Keypair } from '@stellar/stellar-sdk';
import { request as undiciRequest } from 'undici';
import { SpendPolicy, AstrolabeX402Challenge, AstrolabePaymentPayload, PaymentReceipt } from './types';
import { ASTROLABE_CONFIG } from './constants';
import { SpendPolicyEngine } from './policy';
import { ResponseCache } from './cache';
import { RetryGuard } from './retry';
import { TrustTracker } from './trust';
import { FeeSponsoredRelayer } from './relayer';

export interface AstrolabeClientOptions {
  agentSecretKey: string;
  spendPolicy?: SpendPolicy;
  sponsorSecretKey?: string;
  cacheTtlMs?: number;
  maxRetries?: number;
}

export class AstrolabeClient {
  private agentKeypair: Keypair;
  private policyEngine: SpendPolicyEngine;
  private cache: ResponseCache;
  private retryGuard: RetryGuard;
  private trustTracker: TrustTracker;
  private relayer: FeeSponsoredRelayer;

  constructor(options: AstrolabeClientOptions) {
    this.agentKeypair = Keypair.fromSecret(options.agentSecretKey);
    this.policyEngine = new SpendPolicyEngine(options.spendPolicy);
    this.cache = new ResponseCache(options.cacheTtlMs);
    this.retryGuard = new RetryGuard({ maxRetries: options.maxRetries });
    this.trustTracker = new TrustTracker();
    this.relayer = new FeeSponsoredRelayer(options.sponsorSecretKey);
  }

  getAgentAddress(): string {
    return this.agentKeypair.publicKey();
  }

  getPolicy(): SpendPolicyEngine {
    return this.policyEngine;
  }

  getTrustTracker(): TrustTracker {
    return this.trustTracker;
  }

  async get<T = any>(url: string, headers: Record<string, string> = {}): Promise<T> {
    return this.request<T>(url, { method: 'GET', headers });
  }

  async post<T = any>(url: string, body: any, headers: Record<string, string> = {}): Promise<T> {
    return this.request<T>(url, { method: 'POST', body, headers });
  }

  async request<T = any>(
    url: string,
    options: { method?: string; body?: any; headers?: Record<string, string> } = {}
  ): Promise<T> {
    const method = options.method || 'GET';
    const cacheKey = `${method}:${url}`;

    // 1. Check cache for GET requests
    if (method === 'GET') {
      const cached = this.cache.get<T>(cacheKey);
      if (cached) return cached.data;
    }

    const startTime = Date.now();

    return this.retryGuard.executeWithBackoff<T>(async () => {
      // 2. Initial request probe
      const res1 = await undiciRequest(url, {
        method: method as any,
        headers: options.headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      // 3. If not 402, return response directly
      if (res1.statusCode !== 402) {
        const text = await res1.body.text();
        const data = res1.headers['content-type']?.includes('application/json')
          ? JSON.parse(text)
          : text;

        if (res1.statusCode >= 200 && res1.statusCode < 300) {
          if (method === 'GET') this.cache.set(cacheKey, data, res1.statusCode, res1.headers as any);
          this.trustTracker.recordCall(url, true, Date.now() - startTime);
          this.retryGuard.clearAttempts(url);
        } else {
          this.trustTracker.recordCall(url, false, Date.now() - startTime);
        }

        return data as T;
      }

      // 4. Handle HTTP 402 Payment Required Challenge
      this.retryGuard.recordPaymentAttempt(url);
      const challenge = (await res1.body.json()) as AstrolabeX402Challenge;
      const accept = challenge.accepts[0];

      if (!accept) {
        throw new Error('Endpoint returned 402 but accepts list is empty');
      }

      const amountStroops = BigInt(accept.priceStroops);

      // 5. Enforce Spend Policy before creating or signing any transaction
      this.policyEngine.validate(url, amountStroops, accept.assetContractId);

      // 6. Settle payment via Fee-Sponsored Relayer
      const settlement = await this.relayer.settleSponsoredPayment({
        agentKeypair: this.agentKeypair,
        recipient: accept.recipient,
        tokenContract: accept.assetContractId,
        amountStroops,
        nonceHex: accept.nonce,
        serviceId: accept.serviceId,
      });

      // 7. Record policy spend
      this.policyEngine.recordSpend(amountStroops);

      // 8. Re-send request with X-Stellar-Payment settlement proof
      const paymentPayload: AstrolabePaymentPayload = {
        version: 2,
        agentPublicKey: this.agentKeypair.publicKey(),
        serviceId: accept.serviceId,
        nonce: accept.nonce,
        txHash: settlement.txHash,
        mode: 'fee_sponsored',
        amountStroops: accept.priceStroops,
      };

      const res2 = await undiciRequest(url, {
        method: method as any,
        headers: {
          ...(options.headers || {}),
          [ASTROLABE_CONFIG.HEADERS.PAYMENT]: Buffer.from(JSON.stringify(paymentPayload)).toString('base64'),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const resText = await res2.body.text();
      const finalData = res2.headers['content-type']?.includes('application/json')
        ? JSON.parse(resText)
        : resText;

      const latencyMs = Date.now() - startTime;
      const success = res2.statusCode >= 200 && res2.statusCode < 300;
      this.trustTracker.recordCall(accept.serviceId, success, latencyMs);

      if (success) {
        this.retryGuard.clearAttempts(url);
        if (method === 'GET') {
          this.cache.set(cacheKey, finalData, res2.statusCode, res2.headers as any);
        }
      }

      return finalData as T;
    });
  }
}
