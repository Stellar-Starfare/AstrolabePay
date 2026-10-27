import React from 'react';
import { Check, X, ShieldAlert, Sparkles, Layers, Cpu, ArrowRight } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const comparisonItems = [
    {
      feature: 'Underlying Blockchain Network',
      swyftpay: 'Algorand (PyTeal / AVM smart contracts)',
      astrolabe: 'Stellar Soroban (Rust WASM, Protocol 22)',
      advantage: 'Sub-second finality, global fiat on/off ramps (USDC/EURC), stellar dex integration.'
    },
    {
      feature: 'Transaction Fee Sponsorship',
      swyftpay: 'None. Autonomous agents must hold native ALGO for fees.',
      astrolabe: 'Native Stellar Fee-Bump Envelopes & Relayer sponsorship.',
      advantage: 'Zero-gas friction: autonomous agents never get stuck with 0 gas balance.'
    },
    {
      feature: 'Spend Policy Enforcement',
      swyftpay: 'Local in-memory JSON file (trivially bypassed if agent crashes or restarts).',
      astrolabe: 'On-Chain Soroban Smart Contract policy storage & daily rolling spend caps.',
      advantage: 'Immutable, tamper-proof budget governance guaranteed by Stellar consensus.'
    },
    {
      feature: 'Idempotency & Replay Defense',
      swyftpay: 'Basic client-side timestamp cache susceptible to replay attacks.',
      astrolabe: 'Cryptographic nonce hash-locking + on-chain claim tracking.',
      advantage: 'Prevents double-charging even under adversarial network splits.'
    },
    {
      feature: 'Multi-Agent Wallet Registry',
      swyftpay: 'Single hardcoded agent seed phrase.',
      astrolabe: 'Hierarchical deterministic sub-agent keypairs with isolated allowances.',
      advantage: 'Safely spawn swarms of micro-agents with granular individual spending limits.'
    },
    {
      feature: 'AI Framework Integration',
      swyftpay: 'Manual fetch script with no AI framework primitives.',
      astrolabe: 'Turnkey LangChain Tool, OpenAI Function Calling, and AutoGPT adapters.',
      advantage: 'Drop-in 1-line tool registration into standard autonomous agent reasoning loops.'
    },
    {
      feature: 'Edge Reverse Proxy Architecture',
      swyftpay: 'Toy mock server with no rate-limiting or streaming.',
      astrolabe: 'Production Fastify proxy with upstream streaming SSE and receipt injection.',
      advantage: 'Supports real-time token streaming from LLM providers like DeepSeek & Claude.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Intro Header */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <Sparkles color="var(--gold-400)" size={22} />
          <h2 className="font-heading" style={{ fontSize: '1.25rem', color: '#ffffff' }}>
            Critical Architecture Review: SwyftPay vs AstrolabePay
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6' }}>
          A rigorous comparative engineering breakdown between the reference SwyftPay proof-of-concept and AstrolabePay's
          enterprise-grade Stellar Soroban implementation for autonomous machine-to-machine AI economies.
        </p>
      </div>

      {/* Comparison Matrix Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.85rem 1rem', width: '22%' }}>Architectural Dimension</th>
              <th style={{ padding: '0.85rem 1rem', width: '28%', color: 'var(--rose-400)' }}>SwyftPay (Baseline)</th>
              <th style={{ padding: '0.85rem 1rem', width: '28%', color: 'var(--emerald-400)' }}>AstrolabePay (Stellar)</th>
              <th style={{ padding: '0.85rem 1rem', width: '22%' }}>Production Impact</th>
            </tr>
          </thead>
          <tbody>
            {comparisonItems.map((item, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  background: idx % 2 === 0 ? 'rgba(0, 0, 0, 0.15)' : 'transparent'
                }}
              >
                <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: '#ffffff' }}>
                  {item.feature}
                </td>
                <td style={{ padding: '0.9rem 1rem', color: '#fda4af', lineHeight: '1.4' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <X size={15} color="var(--rose-500)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item.swyftpay}</span>
                  </div>
                </td>
                <td style={{ padding: '0.9rem 1rem', color: '#a7f3d0', lineHeight: '1.4' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <Check size={15} color="var(--emerald-400)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item.astrolabe}</span>
                  </div>
                </td>
                <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {item.advantage}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visual Sequence Architecture Card */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="var(--cyan-400)" />
          <span>Autonomous x402 Payment Loop Architecture</span>
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}>
          {[
            {
              step: '1. AI Agent Trigger',
              desc: 'Sub-agent issues HTTP POST to protected API.',
              color: 'var(--gold-400)',
              icon: Cpu
            },
            {
              step: '2. 402 Challenge',
              desc: 'Astrolabe Edge Proxy intercepts and responds with 402 Challenge.',
              color: 'var(--cyan-400)',
              icon: ShieldAlert
            },
            {
              step: '3. On-Chain Settlement',
              desc: 'Soroban contract verifies spend limit, transfers XLM, and emits receipt.',
              color: 'var(--emerald-400)',
              icon: Sparkles
            },
            {
              step: '4. Stream Delivery',
              desc: 'Proxy streams inference tokens with verified transaction hash.',
              color: '#a855f7',
              icon: Layers
            }
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                style={{
                  background: 'rgba(6, 11, 26, 0.7)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '10px',
                  padding: '1.15rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <Icon size={18} color={card.color} />
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#ffffff' }}>{card.step}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: '1.4' }}>
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
