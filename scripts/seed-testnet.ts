import { rpc, Contract, Keypair, TransactionBuilder, nativeToScVal } from '@stellar/stellar-sdk';
import crypto from 'crypto';

const RPC_URL = process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
const CONTRACT_ID = process.env.ASTROLABE_CONTRACT_ID || 'CCPRAZ5DW774LI5DRLIOII7TDWJRRPJLKWSLH6CDAV5MFLCIPVJDV36K';
const SECRET_KEY = process.env.STELLAR_FEE_SPONSOR_SECRET_KEY || 'SCZEAKU3JHHO6MFEUYVDRD35367FXUP5GPF4DBXSX76DAZFHHTUYMUGG';
const NATIVE_SAC = process.env.STELLAR_NATIVE_SAC_ID || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

async function main() {
  const server = new rpc.Server(RPC_URL);
  const keypair = Keypair.fromSecret(SECRET_KEY);
  console.log(`Seeding AstrolabePay Testnet entities with deployer: ${keypair.publicKey()}`);

  const account = await server.getAccount(keypair.publicKey());
  const contract = new Contract(CONTRACT_ID);

  // Register Sample Agent
  try {
    const tx = new TransactionBuilder(account, { fee: '10000', networkPassphrase: NETWORK_PASSPHRASE })
      .addOperation(contract.call('register_agent',
        nativeToScVal(keypair.publicKey(), { type: 'address' }),
        nativeToScVal(keypair.publicKey(), { type: 'address' }),
        nativeToScVal(500000000n, { type: 'i128' }), // 50 XLM daily limit
        nativeToScVal(5000000000n, { type: 'i128' }), // 500 XLM lifetime limit
        nativeToScVal('astrolabe_agent_01', { type: 'symbol' })
      ))
      .setTimeout(30)
      .build();

    const prepared = await server.prepareTransaction(tx);
    prepared.sign(keypair);
    const res = await server.sendTransaction(prepared);
    console.log(`Registered agent: ${res.hash}`);
  } catch (e: any) {
    console.log(`Agent note: ${e.message}`);
  }
}

main().catch(console.error);
