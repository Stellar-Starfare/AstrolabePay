import React, { useState } from 'react';
import { Server, Star, Plus, ShieldCheck, Zap, Activity, ExternalLink, Clock } from 'lucide-react';
import { ServiceEndpoint, INITIAL_SERVICES, truncateAddress } from '../lib/stellar';

interface ProviderRegistryProps {
  services?: ServiceEndpoint[];
}

export const ProviderRegistry: React.FC<ProviderRegistryProps> = () => {
  const [services, setServices] = useState<ServiceEndpoint[]>(INITIAL_SERVICES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [costPerCall, setCostPerCall] = useState(0.05);
  const [endpointUrl, setEndpointUrl] = useState('');
  const [description, setDescription] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !endpointUrl.trim()) return;
    const newService: ServiceEndpoint = {
      id: `svc_${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim(),
      provider: 'GCBZC5TOFMEZ6WXL5TDXAMKP7J5RIVHKYBMPHOYX6WR55UXBCLASC4DY',
      costPerCall,
      asset: 'XLM',
      endpointUrl: endpointUrl.trim(),
      description: description.trim() || 'Custom protected machine-to-machine AI API endpoint.',
      trustScore: 100.0,
      totalCalls: 1,
      uptime: '100.00%',
      p95LatencyMs: 120
    };
    setServices([newService, ...services]);
    setShowAddModal(false);
    setName('');
    setEndpointUrl('');
    setDescription('');
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="font-heading" style={{ fontSize: '1.25rem', color: '#ffffff' }}>
            Decentralized API Provider Registry & Trust Network
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Discover and consume audited HTTP 402 AI micro-services with on-chain trust telemetry and SLA scoring.
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-gold">
          <Plus size={16} />
          <span>Register New Paid API</span>
        </button>
      </div>

      {/* Services List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {services.map((svc) => (
          <div key={svc.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  padding: '8px',
                  borderRadius: '8px',
                  color: 'var(--cyan-400)'
                }}>
                  <Server size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', color: '#ffffff', fontWeight: 600 }}>{svc.name}</h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Provider: {truncateAddress(svc.provider, 4, 4)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(245, 158, 11, 0.12)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                <Star size={13} fill="var(--gold-400)" color="var(--gold-400)" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gold-400)' }}>
                  {svc.trustScore}%
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', minHeight: '38px', lineHeight: '1.4' }}>
              {svc.description}
            </p>

            <div style={{
              background: '#040714',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              color: 'var(--cyan-400)',
              overflowX: 'auto',
              border: '1px solid var(--border-subtle)'
            }}>
              {svc.endpointUrl}
            </div>

            {/* Metrics footer */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '0.75rem',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cost / Call</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-400)' }}>
                  {svc.costPerCall} {svc.asset}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Uptime</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--emerald-400)' }}>
                  {svc.uptime}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>p95 Latency</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                  {svc.p95LatencyMs}ms
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
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
              Register Paid AI Service Endpoint
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              Expose your proprietary model or computation via Astrolabe Edge Reverse Proxy with automated 402 challenge.
            </p>

            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Claude 3.5 Sonnet Reasoning Node"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Upstream Endpoint URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://api.myprovider.com/v1/reason"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Cost Per Call (XLM)
                </label>
                <input
                  type="number"
                  step="0.005"
                  min="0.001"
                  max="50"
                  value={costPerCall}
                  onChange={(e) => setCostPerCall(Number(e.target.value))}
                  className="input-field"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Description / Model Specs
                </label>
                <textarea
                  rows={2}
                  placeholder="Autonomous tool calling, multi-modal vision, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn-gold">
                  Publish to Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
