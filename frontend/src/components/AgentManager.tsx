import React, { useState } from 'react';
import { Bot, Plus, Shield, Sliders, Copy, Check, Power, AlertCircle, Key, ExternalLink, CheckCircle } from 'lucide-react';
import { AgentAccount, createNewAgentKeypair, truncateAddress, CONTRACT_ID } from '../lib/stellar';

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
  const [registrationNotice, setRegistrationNotice] = useState<string | null>(null);

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
    setRegistrationNotice(`Sub-Agent [${newAgent.name}] provisioned with on-chain daily limit ${dailyBudget} XLM. Keypair derived & registered.`);
    setTimeout(() => setRegistrationNotice(null), 5000);
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

      {registrationNotice && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          color: '#a7f3d0',
          fontSize: '0.82rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={16} color="var(--emerald-400)" />
          <span>{registrationNotice}</span>
        </div>
      )}

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
                background: '#040714',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.76rem',
                fontFamily: 'var(--font-mono)'
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {truncateAddress(agent.publicKey, 8, 6)}
                </span>
                <button
                  onClick={() => handleCopy(agent.publicKey)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Copy Public Key"
                >
                  {copiedKey === agent.publicKey ? <Check size={14} color="var(--emerald-400)" /> : <Copy size={14} />}
                </button>
              </div>

              {/* Budget Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>24h Rolling Spend</span>
                  <span style={{ fontWeight: 600, color: percentUsed > 90 ? 'var(--rose-400)' : '#ffffff' }}>
                    {agent.spentToday.toFixed(2)} / {agent.dailyBudget.toFixed(2)} XLM ({percentUsed}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${percentUsed}%`,
                    height: '100%',
                    background: percentUsed > 90 ? 'var(--rose-500)' : 'linear-gradient(90deg, var(--gold-400), var(--cyan-400))',
                    borderRadius: '3px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>

              {/* Policy Limits Summary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                padding: '0.6rem 0.75rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '6px',
                fontSize: '0.75rem',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Max Per Call</div>
                  <div style={{ fontWeight: 600, color: 'var(--cyan-400)' }}>{agent.maxPerCall} XLM</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>On-Chain Policy</div>
                  <div style={{ fontWeight: 600, color: 'var(--emerald-400)' }}>Enforced (Soroban)</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Provision Sub-Agent Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <Shield color="var(--gold-400)" size={22} />
              <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>Provision AI Sub-Agent Keypair</h3>
            </div>

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
