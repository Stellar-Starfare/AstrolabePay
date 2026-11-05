import React, { useState } from 'react';
import { Keypair } from '@stellar/stellar-sdk';
import { Wallet, X, Key, ShieldCheck, RefreshCw, AlertCircle, Copy, Check, Globe } from 'lucide-react';
import { RELAYER_PUBLIC_KEY, DEFAULT_DEMO_SECRET, truncateAddress } from '../lib/stellar';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress: string;
  onSelectAccount: (publicKey: string, secretKey: string) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  currentAddress,
  onSelectAccount
}) => {
  const [customSecret, setCustomSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isConnectingFreighter, setIsConnectingFreighter] = useState(false);

  if (!isOpen) return null;

  const handleUseDemo = () => {
    onSelectAccount(RELAYER_PUBLIC_KEY, DEFAULT_DEMO_SECRET);
    onClose();
  };

  const handleConnectFreighter = async () => {
    setIsConnectingFreighter(true);
    setError(null);
    try {
      const freighter = (window as any).freighterApi;
      if (freighter && typeof freighter.isConnected === 'function') {
        const connected = await freighter.isConnected();
        if (connected) {
          const publicKey = await freighter.getPublicKey();
          onSelectAccount(publicKey, '');
          onClose();
          return;
        }
      }
      // If extension not detected
      setError('Freighter wallet extension not detected. Please install Freighter from https://www.freighter.app or use a dev keypair.');
    } catch (e: any) {
      setError(`Freighter connection failed: ${e.message}`);
    } finally {
      setIsConnectingFreighter(false);
    }
  };

  const handleImportSecret = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const kp = Keypair.fromSecret(customSecret.trim());
      onSelectAccount(kp.publicKey(), customSecret.trim());
      onClose();
    } catch (err) {
      setError('Invalid Stellar secret key. Must start with "S" and have 56 characters.');
    }
  };

  const handleGenerateFresh = () => {
    const kp = Keypair.random();
    onSelectAccount(kp.publicKey(), kp.secret());
    onClose();
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
      <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '1.75rem', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <Wallet color="var(--gold-400)" size={22} />
          <h3 className="font-heading" style={{ fontSize: '1.15rem', color: '#ffffff' }}>
            Stellar Account & Keypair Manager
          </h3>
        </div>

        {/* Current Active Account */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '8px',
          padding: '0.85rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--gold-400)', fontWeight: 600, marginBottom: '0.25rem' }}>
            ACTIVE CONNECTED ACCOUNT
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#ffffff', wordBreak: 'break-all' }}>
            {currentAddress || 'No account selected'}
          </div>
        </div>

        {/* Freighter Web3 Wallet Option */}
        <div style={{ marginBottom: '0.75rem' }}>
          <button
            onClick={handleConnectFreighter}
            disabled={isConnectingFreighter}
            className="btn-ghost"
            style={{ width: '100%', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}
          >
            <Globe size={16} color="var(--cyan-400)" />
            <span>{isConnectingFreighter ? 'Detecting Freighter...' : 'Connect Freighter Wallet'}</span>
          </button>
        </div>

        {/* 1-Click Demo Keypair */}
        <div style={{ marginBottom: '1.25rem' }}>
          <button
            onClick={handleUseDemo}
            className="btn-gold"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <ShieldCheck size={16} />
            <span>Use Funded Testnet Sponsor Account</span>
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          margin: '1.25rem 0',
          color: 'var(--text-muted)',
          fontSize: '0.75rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span>OR IMPORT / GENERATE</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        {/* Custom Key Import */}
        <form onSubmit={handleImportSecret} style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            Import Stellar Secret Key
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="password"
              placeholder="S..."
              value={customSecret}
              onChange={(e) => setCustomSecret(e.target.value)}
              className="input-field"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-cyan">
              Import
            </button>
          </div>
        </form>

        {/* Generate Fresh Keypair */}
        <button
          onClick={handleGenerateFresh}
          className="btn-ghost"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}
        >
          <Key size={14} />
          <span>Generate Fresh Keypair</span>
        </button>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--rose-400)',
            fontSize: '0.78rem',
            marginTop: '1rem',
            background: 'rgba(244, 63, 94, 0.1)',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px'
          }}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
