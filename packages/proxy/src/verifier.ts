import { rpc } from '@stellar/stellar-sdk';
import { AstrolabePaymentPayload, PaymentReceipt, ASTROLABE_CONFIG } from '@astrolabe/sdk';

export class ProxyPaymentVerifier {
  private server: rpc.Server;
  private settledNonces: Set<string> = new Set();

  constructor(rpcUrl: string = ASTROLABE_CONFIG.TESTNET.rpcUrl) {
    this.server = new rpc.Server(rpcUrl);
  }

  async verifyPayment(
    paymentHeaderRaw: string | undefined
  ): Promise<{ valid: boolean; receipt?: PaymentReceipt; error?: string }> {
    if (!paymentHeaderRaw) {
      return { valid: false, error: 'Missing x-stellar-payment header' };
    }

    let payload: AstrolabePaymentPayload;
    try {
      const decoded = paymentHeaderRaw.startsWith('{')
        ? paymentHeaderRaw
        : Buffer.from(paymentHeaderRaw, 'base64').toString('utf-8');
      payload = JSON.parse(decoded);
    } catch {
      return { valid: false, error: 'Malformed x-stellar-payment payload' };
    }

    if (!payload.nonce || !payload.txHash || !payload.agentPublicKey) {
      return { valid: false, error: 'Incomplete payment payload' };
    }

    if (this.settledNonces.has(payload.nonce)) {
      return { valid: false, error: 'Nonce replay rejected' };
    }

    try {
      const tx = await this.server.getTransaction(payload.txHash);
      if (tx.status === 'SUCCESS') {
        this.settledNonces.add(payload.nonce);
        return {
          valid: true,
          receipt: {
            status: 'settled',
            txHash: payload.txHash,
            ledger: tx.ledger || 0,
            agent: payload.agentPublicKey,
            recipient: ASTROLABE_CONFIG.TESTNET.feeSponsorPublicKey,
            serviceId: payload.serviceId,
            amountStroops: payload.amountStroops,
            assetCode: 'XLM',
            settledAt: new Date().toISOString(),
          },
        };
      }
      return { valid: false, error: `Transaction unconfirmed: status is ${tx.status}` };
    } catch (e: any) {
      return { valid: false, error: `RPC verification error: ${e.message}` };
    }
  }
}
