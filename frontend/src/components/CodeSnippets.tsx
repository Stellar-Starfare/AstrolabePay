import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, FileCode, Layers } from 'lucide-react';
import { CONTRACT_ID } from '../lib/stellar';

export const CodeSnippets: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ts' | 'langchain' | 'openai' | 'python' | 'curl'>('ts');
  const [copied, setCopied] = useState(false);

  const snippets: Record<string, string> = {
    ts: `import { AstrolabeClient } from '@astrolabe/sdk';

// Initialize autonomous client with on-chain spend policy
const client = new AstrolabeClient({
  network: 'testnet',
  contractId: '${CONTRACT_ID}',
  agentSecretKey: process.env.STELLAR_AGENT_SECRET!,
  policy: {
    dailyBudgetStroops: 250_000_000n, // 25 XLM / 24hrs
    maxAmountPerRequestStroops: 5_000_000n, // 0.50 XLM max per HTTP 402 request
    allowedHosts: ['proxy.astrolabe.stellar.network']
  }
});

// Autonomous request: Automatically intercepts HTTP 402,
// checks spend policy, obtains fee sponsorship, settles on Soroban,
// and returns verified data payload!
const data = await client.request('https://proxy.astrolabe.stellar.network/v1/deepseek', {
  method: 'POST',
  body: {
    prompt: 'Synthesize optimal cross-chain swap routing between XLM and EURC'
  }
});

console.log('Result:', data);`,

    langchain: `import { createAstrolabeLangChainTool, AstrolabeClient } from '@astrolabe/sdk';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { ChatOpenAI } from '@langchain/openai';

const client = new AstrolabeClient({
  contractId: '${CONTRACT_ID}',
  agentSecretKey: process.env.STELLAR_AGENT_SECRET!,
  policy: { dailyBudgetStroops: 500_000_000n }
});

// Provide autonomous agent with paid capability tool
const deepseekTool = createAstrolabeLangChainTool(client, {
  name: 'deepseek_reasoner',
  description: 'Paid high-intelligence reasoning engine on Stellar Soroban (0.05 XLM/call)',
  endpoint: 'https://proxy.astrolabe.stellar.network/v1/deepseek'
});

const model = new ChatOpenAI({ modelName: 'gpt-4o', temperature: 0 });
const executor = await initializeAgentExecutorWithOptions([deepseekTool], model, {
  agentType: 'structured-chat-zero-shot-react-description'
});

// Agent autonomously pays per invocation through AstrolabePay!
const result = await executor.run(
  'Query the DeepSeek reasoner for mathematically sound yield farming formulas.'
);
console.log('Agent Execution:', result);`,

    openai: `import { createAstrolabeOpenAITool, AstrolabeClient } from '@astrolabe/sdk';
import OpenAI from 'openai';

const client = new AstrolabeClient({
  contractId: '${CONTRACT_ID}',
  agentSecretKey: process.env.STELLAR_AGENT_SECRET!
});

const openai = new OpenAI();
const astrolabeTool = createAstrolabeOpenAITool(client, {
  name: 'query_paid_market_oracle',
  description: 'Fetches real-time Stellar DEX orderbook telemetry (0.01 XLM/call)',
  endpoint: 'https://proxy.astrolabe.stellar.network/v1/oracle/pyth'
});

const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'What is the real-time spread on XLM/USDC?' }],
  tools: [astrolabeTool.definition]
});

// If OpenAI calls the tool, execute the settlement handler:
if (completion.choices[0].message.tool_calls) {
  const toolCall = completion.choices[0].message.tool_calls[0];
  const responseData = await astrolabeTool.execute(JSON.parse(toolCall.function.arguments));
  console.log('Autonomous Settlement Response:', responseData);
}`,

    python: `import os
import json
import requests
from stellar_sdk import Keypair, Server

# 1. Dispatch request to protected x402 endpoint
url = "https://proxy.astrolabe.stellar.network/v1/deepseek"
resp = requests.post(url, json={"prompt": "Run simulation"})

# 2. Check if HTTP 402 Payment Required challenge returned
if resp.status_code == 402:
    challenge = resp.json()
    nonce = challenge["accepts"][0]["nonce"]
    print(f"402 Challenge Nonce: {nonce}")
    # Settle payment with agent secret key on Soroban and retry with x-stellar-payment header`,

    curl: `# 1. Send initial request (will be challenged with HTTP 402 Payment Required)
curl -i -X POST https://proxy.astrolabe.stellar.network/v1/deepseek \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "Calculate optimal AMM arbitrage routes"}'

# 2. Re-send with settled x-stellar-payment header
curl -i -X POST https://proxy.astrolabe.stellar.network/v1/deepseek \\
  -H "Content-Type: application/json" \\
  -H "x-stellar-payment: <BASE64_ENCODED_PAYMENT_PAYLOAD>" \\
  -d '{"prompt": "Calculate optimal AMM arbitrage routes"}'`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Code2 color="var(--gold-400)" size={22} />
          <div>
            <h2 className="font-heading" style={{ fontSize: '1.15rem', color: '#ffffff' }}>
              Multi-Language Agent Integration Code
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              Copy drop-in code snippets for LangChain, OpenAI Function Calling, TypeScript SDK, Python, and cURL.
            </p>
          </div>
        </div>

        <button onClick={handleCopy} className="btn-ghost" style={{ fontSize: '0.8rem' }}>
          {copied ? <Check size={14} color="var(--emerald-400)" /> : <Copy size={14} />}
          <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', overflowX: 'auto' }}>
        {[
          { id: 'ts', label: 'TypeScript SDK' },
          { id: 'langchain', label: 'LangChain Tool' },
          { id: 'openai', label: 'OpenAI Functions' },
          { id: 'python', label: 'Python' },
          { id: 'curl', label: 'cURL CLI' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{
              background: activeTab === t.id ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: activeTab === t.id ? 'var(--gold-400)' : 'var(--text-secondary)',
              border: `1px solid ${activeTab === t.id ? 'rgba(245, 158, 11, 0.4)' : 'transparent'}`,
              borderRadius: '6px',
              padding: '0.4rem 0.8rem',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Code Block */}
      <pre style={{
        background: '#040714',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '1.25rem',
        fontSize: '0.8rem',
        color: '#e2e8f0',
        lineHeight: '1.5',
        overflowX: 'auto',
        fontFamily: 'var(--font-mono)'
      }}>
        <code>{snippets[activeTab]}</code>
      </pre>
    </div>
  );
};
