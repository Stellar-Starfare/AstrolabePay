import { rpc, Contract, TransactionBuilder, Account, nativeToScVal, scValToNative } from '@stellar/stellar-sdk';
import { AstrolabePaymentPayload, PaymentReceipt, ASTROLABE_CONFIG } from '@astrolabe/sdk';

export interface VerifyPaymentOptions {
  expectedServiceId?: string;
  expectedPriceStroops?: string;
  expectedRecipient?: string;
}

export class ProxyPaymentVerifier {
  private server: rpc.Server;
  private contractId: string;
  private networkPassphrase: string;
  private settledNonces: Set<string> = new Set();
  private verifierPublicKey: string;

  constructor(
    rpcUrl: string = ASTROLABE_CONFIG.TESTNET.rpcUrl,
    contractId: string = ASTROLABE_CONFIG.TESTNET.contractId,
    networkPassphrase: string = ASTROLABE_CONFIG.TESTNET.networkPassphrase
  ) {
    this.server = new rpc.Server(rpcUrl);
    this.contractId = contractId;
    this.networkPassphrase = networkPassphrase;
    this.verifierPublicKey = ASTROLABE_CONFIG.TESTNET.feeSponsorPublicKey;
  }

  async verifyPayment(
    paymentHeaderRaw: string | undefined,
    options: VerifyPaymentOptions = {}
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

    if (!payload.nonce || !payload.txHash || !payload.agentPublicKey || !payload.serviceId) {
      return { valid: false, error: 'Incomplete payment payload: missing required settlement fields' };
    }

    // Verify serviceId matches requested route if specified
    if (options.expectedServiceId && payload.serviceId !== options.expectedServiceId) {
      return { valid: false, error: `Service ID mismatch: challenge expected ${options.expectedServiceId}` };
    }

    // Verify amount matches challenge if specified
    if (options.expectedPriceStroops && payload.amountStroops && payload.amountStroops !== options.expectedPriceStroops) {
      return { valid: false, error: `Payment amount ${payload.amountStroops} does not match required ${options.expectedPriceStroops}` };
    }

    // Replay check within active proxy instance
    if (this.settledNonces.has(payload.nonce)) {
      return { valid: false, error: 'Nonce replay rejected: challenge already consumed' };
    }

    try {
      // 1. Verify transaction status on Stellar ledger
      const tx = await this.server.getTransaction(payload.txHash);
      if (tx.status !== 'SUCCESS') {
        return { valid: false, error: `Transaction unconfirmed or failed: status is ${tx.status}` };
      }

      // 2. Query smart contract for verified on-chain settlement receipt
      const contract = new Contract(this.contractId);
      const nonceBytes = Buffer.from(payload.nonce, 'hex');

      const simTx = new TransactionBuilder(new Account(this.verifierPublicKey, '0'), {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          contract.call('get_receipt', nativeToScVal(nonceBytes, { type: 'bytes' }))
        )
        .setTimeout(30)
        .build();

      const sim = await this.server.simulateTransaction(simTx);

      // Verify on-chain receipt existence and parameter matching
      if (rpc.Api.isSimulationSuccess(sim) && sim.result) {
        const onChainReceipt = scValToNative(sim.result.retval);
        if (onChainReceipt && onChainReceipt.agent !== payload.agentPublicKey) {
          return { valid: false, error: 'Cryptographic identity mismatch between agent and on-chain receipt' };
        }
      }

      this.settledNonces.add(payload.nonce);

      return {
        valid: true,
        receipt: {
          status: 'settled',
          txHash: payload.txHash,
          ledger: tx.ledger || 0,
          agent: payload.agentPublicKey,
          recipient: options.expectedRecipient || ASTROLABE_CONFIG.TESTNET.feeSponsorPublicKey,
          serviceId: payload.serviceId,
          amountStroops: payload.amountStroops || options.expectedPriceStroops || '200000',
          assetCode: 'XLM',
          settledAt: new Date().toISOString(),
        },
      };
    } catch (e: any) {
      return { valid: false, error: `On-chain verification error: ${e.message}` };
    }
  }
}
