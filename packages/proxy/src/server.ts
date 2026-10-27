import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { ASTROLABE_CONFIG } from '@astrolabe/sdk';
import { createAstrolabe402Challenge, send402Challenge } from './interceptor';
import { ProxyPaymentVerifier } from './verifier';
import { forwardToOrigin } from './forwarder';

export function buildAstrolabeProxy(port: number = 4022, host: string = '0.0.0.0'): FastifyInstance {
  const server = Fastify({ logger: true });
  const verifier = new ProxyPaymentVerifier();

  server.register(cors, {
    origin: true,
    exposedHeaders: [
      ASTROLABE_CONFIG.HEADERS.PAYMENT,
      ASTROLABE_CONFIG.HEADERS.PAYMENT_RESPONSE,
      ASTROLABE_CONFIG.HEADERS.NONCE,
      ASTROLABE_CONFIG.HEADERS.CHALLENGE,
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
    timestamp: new Date().toISOString(),
  }));

  server.all('/p/:serviceId', handleProxy);
  server.all('/p/:serviceId/*', handleProxy);

  async function handleProxy(req: any, reply: any) {
    const { serviceId } = req.params;
    const originFallback = 'https://httpbin.org/get';

    const paymentHeader = req.headers[ASTROLABE_CONFIG.HEADERS.PAYMENT] as string | undefined;

    if (!paymentHeader) {
      const challenge = createAstrolabe402Challenge(serviceId);
      return send402Challenge(reply, challenge);
    }

    const verification = await verifier.verifyPayment(paymentHeader);
    if (!verification.valid || !verification.receipt) {
      const challenge = createAstrolabe402Challenge(serviceId);
      reply.header('X-Payment-Error', verification.error || 'Invalid payment');
      return send402Challenge(reply, challenge);
    }

    return forwardToOrigin(req, reply, originFallback, verification.receipt);
  }

  return server;
}
