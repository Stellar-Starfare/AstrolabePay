export const ASTROLABE_CONFIG = {
  TESTNET: {
    network: 'stellar-testnet' as const,
    rpcUrl: 'https://soroban-testnet.stellar.org',
    horizonUrl: 'https://horizon-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
    contractId: 'CCPRAZ5DW774LI5DRLIOII7TDWJRRPJLKWSLH6CDAV5MFLCIPVJDV36K',
    nativeSac: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    testnetUsdc: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWUIE3USSTHZX5COQN4',
    feeSponsorPublicKey: 'GCBZC5TOFMEZ6WXL5TDXAMKP7J5RIVHKYBMPHOYX6WR55UXBCLASC4DY',
    explorerBase: 'https://stellar.expert/explorer/testnet',
  },
  HEADERS: {
    PAYMENT: 'x-stellar-payment',
    PAYMENT_RESPONSE: 'x-stellar-payment-response',
    NONCE: 'x-stellar-nonce',
    CHALLENGE: 'x-stellar-challenge',
    AGENT_AUTH: 'x-astrolabe-agent-auth',
  },
};
