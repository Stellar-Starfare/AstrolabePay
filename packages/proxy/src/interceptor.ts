import crypto from 'crypto';
import { FastifyReply } from 'fastify';
import { AstrolabeX402Challenge, ASTROLABE_CONFIG } from '@astrolabe/sdk';

export function createAstrolabe402Challenge(
  serviceId: string,
  priceStroops: string = '200000',
  recipient: string = ASTROLABE_CONFIG.TESTNET.feeSponsorPublicKey,
  tokenContract: string = ASTROLABE_CONFIG.TESTNET.nativeSac
): AstrolabeX402Challenge {
  const nonce = crypto.randomBytes(32).toString('hex');
  const priceFormatted = (Number(priceStroops) / 10000000).toFixed(4) + ' XLM';

  return {
    x402Version: 2,
    title: `Payment Required — AstrolabePay Protected API`,
    description: `Access to ${serviceId} requires a fee-sponsored Soroban micropayment of ${priceFormatted}.`,
    serviceId,
    accepts: [
      {
        scheme: 'sponsored',
        network: 'stellar-testnet',
        contractId: ASTROLABE_CONFIG.TESTNET.contractId,
        serviceId,
        priceStroops,
        priceFormatted,
        assetCode: 'XLM',
        assetContractId: tokenContract,
        recipient,
        nonce,
        sponsorEndpoint: '/relay',
      },
    ],
  };
}

export function send402Challenge(reply: FastifyReply, challenge: AstrolabeX402Challenge): void {
  const nonce = challenge.accepts[0]?.nonce || '';
  reply
    .status(402)
    .header('Content-Type', 'application/json; charset=utf-8')
    .header('WWW-Authenticate', `Stellar-x402 contract="${challenge.accepts[0]?.contractId}", nonce="${nonce}"`)
    .header(ASTROLABE_CONFIG.HEADERS.NONCE, nonce)
    .header(ASTROLABE_CONFIG.HEADERS.CHALLENGE, Buffer.from(JSON.stringify(challenge)).toString('base64'))
    .send(challenge);
}
