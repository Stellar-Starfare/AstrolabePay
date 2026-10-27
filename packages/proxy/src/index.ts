import { buildAstrolabeProxy } from './server';

export * from './server';
export * from './interceptor';
export * from './verifier';
export * from './forwarder';

if (require.main === module) {
  const port = Number(process.env.PORT) || 4022;
  const host = process.env.HOST || '0.0.0.0';
  const server = buildAstrolabeProxy(port, host);

  server.listen({ port, host }, (err, address) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    console.log(`\n🌌 AstrolabePay Edge Proxy & Relayer listening at: ${address}`);
  });
}
