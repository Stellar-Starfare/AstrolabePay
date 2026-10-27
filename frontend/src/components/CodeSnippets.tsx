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
    dailyBudget: 25.0,    // 25 XLM / 24hrs
    maxPerCall: 0.50,     // 0.50 XLM max per HTTP 402 request
    allowedHosts: ['proxy.astrolabe.stellar.network']
  },
  relayerUrl: 'https://proxy.astrolabe.stellar.network'
});

// Autonomous request: Automatically intercepts HTTP 402,
// checks spend policy, obtains fee sponsorship, settles on Soroban,
// and resolves verified data payload!
const response = await client.fetch('https://proxy.astrolabe.stellar.network/v1/deepseek', {
  method: 'POST',
  body: JSON.stringify({
    prompt: 'Synthesize optimal cross-chain swap routing between XLM and EURC'
  })
});

const data = await response.json();
console.log('Result:', data);
console.log('Soroban Tx:', response.headers.get('x-astrolabe-tx-hash'));`,

    langchain: `import { createAstrolabeLangChainTool, AstrolabeClient } from '@astrolabe/sdk';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { ChatOpenAI } from '@langchain/openai';

const client = new AstrolabeClient({
  contractId: '${CONTRACT_ID}',
  agentSecretKey: process.env.STELLAR_AGENT_SECRET!,
  policy: { dailyBudget: 50.0, maxPerCall: 1.0 }
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
);`,

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

// If OpenAI calls the tool, execute the settlement hook:
if (completion.choices[0].message.tool_calls) {
  const toolCall = completion.choices[0].message.tool_calls[0];
  const responseData = await astrolabeTool.execute(JSON.parse(toolCall.function.arguments));
  console.log('Autonomous Settlement Response:', responseData);
}`,

    python: `import os
import requests
from stellar_sdk import Keypair, Server

# 1. Dispatch request
url = "https://proxy.astrolabe.stellar.network/v1/deepseek"
resp = requests.post(url, json={"prompt": "Run simulation"})

# 2. Handle HTTP 402 Challenge
if resp.status_code == 402:
    challenge = resp.json()["challenge"]
    cost = challenge["cost"]
    payee = challenge["payee"]
    nonce = challenge["nonce"]
    
    # 3. Request fee-bump sponsorship & sign Soroban auth
    # Contract: ${CONTRACT_ID}
    print(f"Challenged: {cost} XLM to {payee}")
    # Submit payment and retry with Authorization: Astrolabe-Receipt <hash>`,

    curl: `# 1. Initial invocation (Protected endpoint returns HTTP 402)
curl -i -X POST https://proxy.astrolabe.stellar.network/v1/deepseek \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "Generate market analysis"}'

# Output:
# HTTP/1.1 402 Payment Required
# X-Astrolabe-Contract: ${CONTRACT_ID}
# X-Astrolabe-Cost: 0.05
# X-Astrolabe-Asset: XLM
# X-Astrolabe-Nonce: ast_9b7351a5434e

# 2. Fulfill with settled Stellar Transaction Hash
curl -i -X POST https://proxy.astrolabe.stellar.network/v1/deepseek \\
  -H "Content-Type: application/json" \\
  -H "X-Astrolabe-Tx-Hash: 9b7351a5434e40dd1e572662c430bb796c42d8205aa18653b629802856647fe7" \\
  -d '{"prompt": "Generate market analysis"}'`
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
          <FileCode color="var(--gold-400)" size={22} />
          <div>
            <h2 className="font-heading" style={{ fontSize: '1.2rem', color: '#ffffff' }}>
              Autonomous Agent Integration SDK
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              Zero-friction client libraries for Node.js, LangChain, OpenAI Agents, AutoGPT, and Python.
            </p>
          </div>
        </div>

        <button onClick={handleCopy} className="btn-outline" style={{ padding: '0.45rem 0.85rem' }}>
          {copied ? <Check size={14} color="var(--emerald-400)" /> : <Copy size={14} />}
          <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1rem', overflowX: 'auto' }}>
        {[
          { id: 'ts', label: 'TypeScript / Node.js' },
          { id: 'langchain', label: 'LangChain Tool' },
          { id: 'openai', label: 'OpenAI Agent Tool' },
          { id: 'python', label: 'Python Requests' },
          { id: 'curl', label: 'cURL & Raw HTTP' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`nav-tab ${activeTab === t.id ? 'active' : ''}`}
            style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Code Editor view */}
      <pre style={{
        background: '#040714',
        borderRadius: '8px',
        padding: '1.25rem',
        color: '#e2e8f0',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8rem',
        lineHeight: '1.6',
        overflowX: 'auto',
        border: '1px solid var(--border-subtle)',
        maxHeight: '440px'
      }}>
        <code>{snippets[activeTab]}</code>
      </pre>
    </div>
  );
};
