import React, { useState } from 'react';
import { Droplet, X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { requestFriendbot, truncateAddress } from '../lib/stellar';

interface FaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAddress: string;
  onFundSuccess: () => void;
}

export const FaucetModal: React.FC<FaucetModalProps> = ({
  isOpen,
  onClose,
  targetAddress,
  onFundSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFund = async () => {
    if (!targetAddress) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const ok = await requestFriendbot(targetAddress);
      if (ok) {
        setSuccess(true);
        onFundSuccess();
      } else {
        setError('Friendbot request returned a non-200 response. Account might already be funded.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to contact friendbot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '1.75rem', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <div style={{
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            padding: '8px',
            borderRadius: '8px',
            color: 'var(--cyan-400)'
          }}>
            <Droplet size={22} />
          </div>
          <div>
            <h3 className="font-heading" style={{ fontSize: '1.15rem', color: '#ffffff' }}>
              Stellar Testnet Friendbot
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              10,000 Testnet XLM Faucet
            </div>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
          Request native testnet lumens directly to your connected autonomous agent or developer address via the official Stellar Horizon Friendbot.
        </p>

        <div style={{
          background: '#040714',
          borderRadius: '8px',
          padding: '0.75rem',
          border: '1px solid var(--border-subtle)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--cyan-400)',
          wordBreak: 'break-all',
          marginBottom: '1.25rem'
        }}>
          Target: {targetAddress || 'No account selected'}
        </div>

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1.25rem',
            color: 'var(--emerald-400)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={16} />
            <span>Success! 10,000 XLM credited on Stellar Testnet.</span>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1.25rem',
            color: 'var(--rose-400)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleFund}
          disabled={loading || !targetAddress}
          className="btn-gold"
          style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Requesting 10,000 XLM from Friendbot...</span>
            </>
          ) : (
            <>
              <Droplet size={16} />
              <span>Claim 10,000 Testnet XLM</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
