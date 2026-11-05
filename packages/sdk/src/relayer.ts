import { rpc, Contract, Keypair, TransactionBuilder, nativeToScVal } from '@stellar/stellar-sdk';
import { ASTROLABE_CONFIG } from './constants';

export interface SponsoredSettlementParams {
  agentKeypair: Keypair;
  recipient: string;
  tokenContract: string;
  amountStroops: bigint;
  nonceHex: string;
  serviceId: string;
  sponsorSecretKey?: string;
}

export class FeeSponsoredRelayer {
  private server: rpc.Server;
  private networkPassphrase: string;
  private sponsorKeypair?: Keypair;
  private contractId: string;

  constructor(
    sponsorSecretKey?: string,
    rpcUrl: string = ASTROLABE_CONFIG.TESTNET.rpcUrl,
    contractId: string = ASTROLABE_CONFIG.TESTNET.contractId
  ) {
    this.server = new rpc.Server(rpcUrl);
    this.networkPassphrase = ASTROLABE_CONFIG.TESTNET.networkPassphrase;
    this.contractId = contractId;

    const key =
      sponsorSecretKey ||
      (typeof process !== 'undefined' && process.env?.STELLAR_FEE_SPONSOR_SECRET_KEY);
    if (key) {
      this.sponsorKeypair = Keypair.fromSecret(key);
    }
  }

  async settleSponsoredPayment(params: SponsoredSettlementParams): Promise<{
    txHash: string;
    ledger: number;
  }> {
    const key = params.sponsorSecretKey;
    const sponsorKeypair = key ? Keypair.fromSecret(key) : this.sponsorKeypair;

    if (!sponsorKeypair) {
      throw new Error(
        'FeeSponsoredRelayer: No fee sponsor key provided. Pass sponsorSecretKey to AstrolabeClient or set STELLAR_FEE_SPONSOR_SECRET_KEY in the environment.'
      );
    }

    // 1. Fee Sponsor is transaction source account paying the gas fees
    const sponsorAccount = await this.server.getAccount(sponsorKeypair.publicKey());
    const contract = new Contract(this.contractId);
    const nonceBytes = Buffer.from(params.nonceHex, 'hex');

    // 2. Build invocation
    const tx = new TransactionBuilder(sponsorAccount, {
      fee: '10000',
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'settle_agent_payment',
          nativeToScVal(params.agentKeypair.publicKey(), { type: 'address' }),
          nativeToScVal(params.recipient, { type: 'address' }),
          nativeToScVal(params.tokenContract, { type: 'address' }),
          nativeToScVal(params.amountStroops, { type: 'i128' }),
          nativeToScVal(nonceBytes, { type: 'bytes' }),
          nativeToScVal(params.serviceId, { type: 'symbol' })
        )
      )
      .setTimeout(30)
      .build();

    // 3. Simulate and prepare auth entries
    const prepared = await this.server.prepareTransaction(tx);

    // 4. Agent signs Soroban authorization entry; Sponsor signs network envelope
    prepared.sign(params.agentKeypair);
    prepared.sign(sponsorKeypair);

    const sendRes = await this.server.sendTransaction(prepared);
    if (sendRes.status === 'ERROR') {
      throw new Error(`Relayer transaction simulation failed: ${JSON.stringify(sendRes.errorResult)}`);
    }

    let getRes = await this.server.getTransaction(sendRes.hash);
    while (getRes.status === 'NOT_FOUND') {
      await new Promise((r) => setTimeout(r, 1000));
      getRes = await this.server.getTransaction(sendRes.hash);
    }

    if (getRes.status !== 'SUCCESS') {
      throw new Error(`On-chain transaction execution failed: ${getRes.status}`);
    }

    return {
      txHash: sendRes.hash,
      ledger: getRes.ledger,
    };
  }
}
