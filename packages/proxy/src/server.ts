import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { ASTROLABE_CONFIG } from '@astrolabe/sdk';
import { createAstrolabe402Challenge, send402Challenge } from './interceptor';
import { ProxyPaymentVerifier } from './verifier';
import { forwardToOrigin } from './forwarder';

export interface ProxyServerOptions {
  port?: number;
  host?: string;
  serviceOrigins?: Record<string, string>;
}

export const DEFAULT_SERVICE_ORIGINS: Record<string, string> = {
  deepseek_reasoner: process.env.UPSTREAM_DEEPSEEK_URL || 'https://httpbin.org/post',
  stellar_market_oracle: process.env.UPSTREAM_ORACLE_URL || 'https://httpbin.org/get',
  web_retrieval_agent: process.env.UPSTREAM_SEARCH_URL || 'https://httpbin.org/get',
  solidity_verifier: process.env.UPSTREAM_VERIFIER_URL || 'https://httpbin.org/post',
};

export function buildAstrolabeProxy(options: ProxyServerOptions = {}): FastifyInstance {
  const server = Fastify({ logger: true });
  const verifier = new ProxyPaymentVerifier();
  const serviceOrigins = { ...DEFAULT_SERVICE_ORIGINS, ...(options.serviceOrigins || {}) };

  server.register(cors, {
    origin: true,
    exposedHeaders: [
      ASTROLABE_CONFIG.HEADERS.PAYMENT,
      ASTROLABE_CONFIG.HEADERS.PAYMENT_RESPONSE,
      ASTROLABE_CONFIG.HEADERS.NONCE,
      ASTROLABE_CONFIG.HEADERS.CHALLENGE,
      'x-astrolabe-tx-hash',
      'x-astrolabe-receipt-signature',
      'www-authenticate',
    ],
  });

  server.register(rateLimit, {
    max: 150,
    timeWindow: '1 minute',
  });

  server.get('/health', async () => ({
    status: 'ok',
    service: 'AstrolabePay Edge Proxy & Relayer',
    contractId: ASTROLABE_CONFIG.TESTNET.contractId,
    network: 'stellar-testnet',
    feeSponsor: ASTROLABE_CONFIG.TESTNET.feeSponsorPublicKey,
    activeRoutes: Object.keys(serviceOrigins),
    timestamp: new Date().toISOString(),
  }));

  server.all('/p/:serviceId', handleProxy);
  server.all('/p/:serviceId/*', handleProxy);
  server.all('/v1/:serviceId', handleProxy);
  server.all('/v1/:serviceId/*', handleProxy);

  async function handleProxy(req: any, reply: any) {
    const { serviceId } = req.params;
    const originTarget = serviceOrigins[serviceId] || 'https://httpbin.org/get';

    const paymentHeader = req.headers[ASTROLABE_CONFIG.HEADERS.PAYMENT] as string | undefined;

    if (!paymentHeader) {
      const challenge = createAstrolabe402Challenge(serviceId);
      return send402Challenge(reply, challenge);
    }

    const verification = await verifier.verifyPayment(paymentHeader, {
      expectedServiceId: serviceId,
    });

    if (!verification.valid || !verification.receipt) {
      const challenge = createAstrolabe402Challenge(serviceId);
      reply.header('X-Payment-Error', verification.error || 'Invalid payment');
      return send402Challenge(reply, challenge);
    }

    return forwardToOrigin(req, reply, originTarget, verification.receipt);
  }

  return server;
}
