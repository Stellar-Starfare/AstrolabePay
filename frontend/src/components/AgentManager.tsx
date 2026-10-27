import React, { useState } from 'react';
import { Bot, Plus, Shield, Sliders, Copy, Check, Power, AlertCircle, Key } from 'lucide-react';
import { AgentAccount, createNewAgentKeypair, truncateAddress } from '../lib/stellar';

interface AgentManagerProps {
  agents: AgentAccount[];
  onAddAgent: (agent: AgentAccount) => void;
  onToggleStatus: (agentId: string) => void;
  onUpdateBudget: (agentId: string, newDailyBudget: number, newMaxPerCall: number) => void;
}

export const AgentManager: React.FC<AgentManagerProps> = ({
  agents,
  onAddAgent,
  onToggleStatus,
  onUpdateBudget
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [dailyBudget, setDailyBudget] = useState(25);
  const [maxPerCall, setMaxPerCall] = useState(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newAgent = createNewAgentKeypair(name.trim(), dailyBudget, maxPerCall);
    onAddAgent(newAgent);
    setName('');
    setShowCreateModal(false);
  };

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="font-heading" style={{ fontSize: '1.25rem', color: '#ffffff' }}>
            Autonomous AI Sub-Agent Fleet
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Manage isolated agent wallets, enforce on-chain spend allowances, and prevent runaway execution loops.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-gold"
        >
          <Plus size={16} />
          <span>Provision New Sub-Agent</span>
        </button>
      </div>

      {/* Agent Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {agents.map((agent) => {
          const percentUsed = Math.min(100, Math.round((agent.spentToday / agent.dailyBudget) * 100));
          return (
            <div key={agent.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Card top */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    padding: '8px',
                    borderRadius: '8px',
                    color: 'var(--gold-400)'
                  }}>
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.98rem', color: '#ffffff', fontWeight: 600 }}>{agent.name}</h3>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>ID: {agent.id}</div>
                  </div>
                </div>

                <button
                  onClick={() => onToggleStatus(agent.id)}
                  style={{
                    background: agent.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    color: agent.status === 'ACTIVE' ? 'var(--emerald-400)' : 'var(--rose-400)',
                    border: `1px solid ${agent.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                    borderRadius: '6px',
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                  title="Toggle Agent Active/Paused state"
                >
                  <Power size={12} />
                  <span>{agent.status}</span>
                </button>
              </div>

              {/* Public key */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '0.45rem 0.65rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Key size={13} color="var(--gold-400)" />
                  <span>{truncateAddress(agent.publicKey, 6, 6)}</span>
                </div>
                <button
                  onClick={() => handleCopy(agent.publicKey)}
                  className="btn-ghost"
                  style={{ padding: '0.2rem' }}
                  title="Copy Agent Stellar Public Key"
                >
                  {copiedKey === agent.publicKey ? <Check size={13} color="var(--emerald-400)" /> : <Copy size={13} />}
                </button>
              </div>

              {/* Daily Budget Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Daily Spend Cap</span>
                  <span style={{ fontWeight: 600, color: '#ffffff' }}>
                    {agent.spentToday.toFixed(2)} / {agent.dailyBudget} XLM ({percentUsed}%)
                  </span>
                </div>
                <div style={{ background: '#1e293b', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${percentUsed}%`,
                    height: '100%',
                    background: percentUsed > 85 ? 'var(--rose-500)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Policy Limits Summary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                fontSize: '0.76rem',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--border-glass)'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Max / Call: </span>
                  <span style={{ fontWeight: 600, color: 'var(--cyan-400)' }}>{agent.maxPerCall} XLM</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Policy: </span>
                  <span style={{ fontWeight: 600, color: 'var(--emerald-400)' }}>On-Chain</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Provisioning New Agent */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '0.5rem' }}>
              Provision Autonomous Sub-Agent
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              Generates a dedicated cryptographic Stellar keypair with on-chain Soroban spend policy rules.
            </p>

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Agent Identifier / Role Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arbitrage Scanner Bot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Daily Budget Allowance (XLM)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(Number(e.target.value))}
                  className="input-field"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Max Cost Allowed Per Single Call (XLM)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="50"
                  value={maxPerCall}
                  onChange={(e) => setMaxPerCall(Number(e.target.value))}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold"
                >
                  Generate Keypair & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
