import { FastifyReply, FastifyRequest } from 'fastify';
import { request as undiciRequest } from 'undici';
import { PaymentReceipt, ASTROLABE_CONFIG } from '@astrolabe/sdk';

export async function forwardToOrigin(
  req: FastifyRequest,
  reply: FastifyReply,
  originUrl: string,
  receipt: PaymentReceipt
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

  try {
    const upstreamRes = await undiciRequest(url.toString(), {
      method: req.method as any,
      headers: forwardHeaders,
      body: req.body ? JSON.stringify(req.body) : undefined,
    });

    reply.status(upstreamRes.statusCode);

    for (const [key, value] of Object.entries(upstreamRes.headers)) {
      if (value && key !== 'content-length' && key !== 'transfer-encoding') {
        reply.header(key, value);
      }
    }

    reply.header(
      ASTROLABE_CONFIG.HEADERS.PAYMENT_RESPONSE,
      Buffer.from(JSON.stringify(receipt)).toString('base64')
    );

    const bodyText = await upstreamRes.body.text();
    reply.send(bodyText);
  } catch (err: any) {
    reply.status(502).send({
      error: 'Bad Gateway',
      message: `Failed to reach upstream origin: ${err.message}`,
      receipt,
    });
  }
}
