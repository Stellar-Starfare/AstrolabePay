import { FastifyReply, FastifyRequest } from 'fastify';
import { request as undiciRequest } from 'undici';
import crypto from 'crypto';
import { Keypair } from '@stellar/stellar-sdk';
import { PaymentReceipt, ASTROLABE_CONFIG } from '@astrolabe/sdk';

export interface ForwarderOptions {
  signerSecretKey?: string;
}

export async function forwardToOrigin(
  req: FastifyRequest,
  reply: FastifyReply,
  originUrl: string,
  receipt: PaymentReceipt,
  options: ForwarderOptions = {}
): Promise<void> {
  const url = new URL(originUrl);
  const reqUrl = new URL(req.url, 'http://localhost');
  const pathParts = reqUrl.pathname.split('/').filter(Boolean);
  const subPath = pathParts.slice(2).join('/');
  if (subPath) {
    url.pathname = `${url.pathname.replace(/\/$/, '')}/${subPath}`;
  }
  url.search = reqUrl.search;

  const forwardHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (
      value &&
      !key.startsWith('x-stellar-') &&
      !key.startsWith('x-astrolabe-') &&
      key !== 'host' &&
      key !== 'connection' &&
      key !== 'content-length'
    ) {
      forwardHeaders[key] = Array.isArray(value) ? value.join(', ') : value;
    }
  }

  // Generate cryptographic Ed25519 signature over settlement receipt
  const receiptJson = JSON.stringify(receipt);
  let receiptSignature: string | undefined;
  const signingKey =
    options.signerSecretKey ||
    (typeof process !== 'undefined' && process.env?.STELLAR_FEE_SPONSOR_SECRET_KEY);

  if (signingKey) {
    try {
      const kp = Keypair.fromSecret(signingKey);
      const digest = crypto.createHash('sha256').update(receiptJson).digest();
      receiptSignature = kp.sign(digest).toString('hex');
    } catch {
      // Ignore signing error if key format invalid
    }
  }

  try {
    const upstreamRes = await undiciRequest(url.toString(), {
      method: req.method as any,
      headers: forwardHeaders,
      body: req.body ? JSON.stringify(req.body) : undefined,
    });

    for (const [key, value] of Object.entries(upstreamRes.headers)) {
      if (value && key !== 'content-length' && key !== 'connection') {
        reply.raw.setHeader(key, value);
      }
    }

    reply.raw.setHeader(
      ASTROLABE_CONFIG.HEADERS.PAYMENT_RESPONSE,
      Buffer.from(receiptJson).toString('base64')
    );
    reply.raw.setHeader('X-Astrolabe-Tx-Hash', receipt.txHash);
    if (receiptSignature) {
      reply.raw.setHeader('X-Astrolabe-Receipt-Signature', receiptSignature);
    }

    reply.raw.statusCode = upstreamRes.statusCode;

    // True non-blocking chunked / SSE stream forwarding
    if (upstreamRes.body) {
      for await (const chunk of upstreamRes.body) {
        reply.raw.write(chunk);
      }
      reply.raw.end();
    } else {
      reply.raw.end();
    }
  } catch (err: any) {
    if (!reply.raw.headersSent) {
      reply.status(502).send({
        error: 'Bad Gateway',
        message: `Failed to reach upstream origin: ${err.message}`,
        receipt,
      });
    }
  }
}
