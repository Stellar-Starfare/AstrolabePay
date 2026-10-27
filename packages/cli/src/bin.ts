#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { Keypair } from '@stellar/stellar-sdk';
import { request as undiciRequest } from 'undici';
import { AstrolabeClient, ASTROLABE_CONFIG, AgentWalletManager } from '@astrolabe/sdk';
import { buildAstrolabeProxy } from '@astrolabe/proxy';

const program = new Command();

program
  .name('astrolabe')
  .description('AstrolabePay — Autonomous AI Agent Payment Tool on Stellar Soroban')
  .version('2.0.0');

program
  .command('balance [address]')
  .description('Check Stellar Testnet XLM and USDC balances')
  .action(async (address) => {
    const target = address || ASTROLABE_CONFIG.TESTNET.feeSponsorPublicKey;
    console.log(chalk.cyan(`\nChecking balance for ${target}...`));
    try {
      const res = await undiciRequest(`${ASTROLABE_CONFIG.TESTNET.horizonUrl}/accounts/${target}`);
      if (!res.ok) {
        console.log(chalk.yellow(`Account not funded on Testnet yet.`));
        return;
      }
      const data = (await res.body.json()) as any;
      console.log(chalk.green(`\nBalances for ${target}:`));
      for (const b of data.balances) {
        const name = b.asset_type === 'native' ? 'XLM' : b.asset_code;
        console.log(`• ${name}: ${b.balance}`);
      }
    } catch (e: any) {
      console.error(chalk.red(`Failed to query Horizon: ${e.message}`));
    }
  });

program
  .command('fetch <url>')
  .description('Call an x402-monetized endpoint with autonomous fee-sponsored settlement')
  .option('-s, --secret <secretKey>', 'Agent secret key')
  .action(async (url, opts) => {
    const secret = opts.secret || 'SCZEAKU3JHHO6MFEUYVDRD35367FXUP5GPF4DBXSX76DAZFHHTUYMUGG';
    console.log(chalk.cyan(`\n🚀 AstrolabePay Client: Fetching ${url}`));
    const client = new AstrolabeClient({
      agentSecretKey: secret,
      spendPolicy: {
        maxAmountPerRequestStroops: 10000000n, // 1 XLM cap
      },
    });

    try {
      const data = await client.get(url);
      console.log(chalk.green(`\n✓ Response (HTTP 200 OK):`));
      console.log(JSON.stringify(data, null, 2));
    } catch (e: any) {
      console.error(chalk.red(`Request failed: ${e.message}`));
    }
  });

program
  .command('agent:create <agentId> <name>')
  .description('Derive a new autonomous agent keypair with daily limits')
  .action((agentId, name) => {
    const master = 'SCZEAKU3JHHO6MFEUYVDRD35367FXUP5GPF4DBXSX76DAZFHHTUYMUGG';
    const manager = new AgentWalletManager(master);
    const agent = manager.createAgent(agentId, name, {
      dailyLimitStroops: 50000000n, // 5 XLM
      totalLimitStroops: 500000000n, // 50 XLM
      alertThreshold: 0.8,
    });

    console.log(chalk.cyan(`\n🤖 Created Sub-Agent: ${agent.name}`));
    console.log(chalk.yellow(`• Agent ID:    ${agent.id}`));
    console.log(chalk.yellow(`• Public Key:  ${agent.publicKey}`));
    console.log(chalk.yellow(`• Daily Limit: 5.00 XLM`));
    console.log(chalk.gray(`• Secret Key:  ${agent.secretKey}\n`));
  });

program
  .command('serve')
  .description('Start AstrolabePay edge reverse proxy')
  .option('-p, --port <port>', 'Port number', '4022')
  .action((opts) => {
    const port = Number(opts.port) || 4022;
    const server = buildAstrolabeProxy(port);
    server.listen({ port, host: '0.0.0.0' }, (err, address) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(chalk.green(`✓ AstrolabePay Proxy running at ${address}`));
    });
  });

program.parse(process.argv);
