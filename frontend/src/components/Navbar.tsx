import React from 'react';
import { Compass, ExternalLink, Droplet, Wallet, ShieldCheck, Zap } from 'lucide-react';
import { CONTRACT_ID, TokenBalance, truncateAddress } from '../lib/stellar';

interface NavbarProps {
  currentAddress: string;
  balances: TokenBalance[];
  onOpenWalletModal: () => void;
  onOpenFaucetModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentAddress,
  balances,
  onOpenWalletModal,
  onOpenFaucetModal,
}) => {
  const xlmBalance = balances.find(b => b.asset === 'XLM')?.balance || '0.00';

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: '1rem',
      zIndex: 50,
      margin: '1rem auto',
      maxWidth: '1280px',
      padding: '0.85rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      {/* Brand & Network */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
            padding: '8px',
            borderRadius: '10px',
            boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Compass size={24} color="#060813" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                Astrolabe<span style={{ color: 'var(--gold-400)' }}>Pay</span>
              </span>
              <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>v1.0</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span className="pulse-dot" />
              <span>Stellar Testnet Protocol 22</span>
            </div>
          </div>
        </div>

        {/* Contract ID Explorer Pill */}
        <a
          href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            padding: '0.35rem 0.75rem',
            borderRadius: '8px',
            color: 'var(--cyan-400)',
            textDecoration: 'none',
            fontSize: '0.78rem',
            transition: 'all 0.2s ease'
          }}
          title="Inspect live deployed contract on Stellar.Expert"
        >
          <ShieldCheck size={14} />
          <span>Contract: {truncateAddress(CONTRACT_ID, 4, 4)}</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Right Controls: Faucet, Balance, Wallet */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Faucet Button */}
        <button
          onClick={onOpenFaucetModal}
          className="btn-ghost"
          style={{
            background: 'rgba(6, 182, 212, 0.12)',
            color: 'var(--cyan-400)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: '8px',
            padding: '0.45rem 0.85rem'
          }}
          title="Fund testnet account with 10,000 test XLM via Friendbot"
        >
          <Droplet size={15} />
          <span style={{ fontWeight: 600 }}>Friendbot Faucet</span>
        </button>

        {/* Balance Display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '0.45rem 0.85rem',
          fontSize: '0.85rem'
        }}>
          <Zap size={14} color="var(--gold-400)" />
          <span style={{ color: 'var(--text-muted)' }}>Balance:</span>
          <span style={{ fontWeight: 700, color: '#ffffff' }}>{xlmBalance} XLM</span>
        </div>

        {/* Wallet Button */}
        <button
          onClick={onOpenWalletModal}
          className="btn-gold"
          style={{ padding: '0.5rem 1rem' }}
        >
          <Wallet size={16} />
          <span>{truncateAddress(currentAddress, 4, 4) || 'Connect Wallet'}</span>
        </button>
      </div>
    </header>
  );
};
