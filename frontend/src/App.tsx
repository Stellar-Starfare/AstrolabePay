import React, { useState, useEffect } from 'react';
import {
  Compass,
  Cpu,
  Bot,
  Server,
  FileCode,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  TrendingUp,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { AgentSimulator } from './components/AgentSimulator';
import { AgentManager } from './components/AgentManager';
import { ProviderRegistry } from './components/ProviderRegistry';
import { CodeSnippets } from './components/CodeSnippets';
import { ArchitectureView } from './components/ArchitectureView';
import { WalletModal } from './components/WalletModal';
import { FaucetModal } from './components/FaucetModal';
import {
  RELAYER_PUBLIC_KEY,
  DEFAULT_DEMO_SECRET,
  CONTRACT_ID,
  TokenBalance,
  AgentAccount,
  fetchAccountBalances
} from './lib/stellar';

export const App: React.FC = () => {
  const [currentAddress, setCurrentAddress] = useState<string>(RELAYER_PUBLIC_KEY);
  const [currentSecret, setCurrentSecret] = useState<string>(DEFAULT_DEMO_SECRET);
  const [balances, setBalances] = useState<TokenBalance[]>([{ asset: 'XLM', balance: '9998.40' }]);
  const [activeTab, setActiveTab] = useState<'simulator' | 'agents' | 'providers' | 'sdk' | 'architecture'>('simulator');
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);

  // Initial Seeded Sub-Agents
  const [agents, setAgents] = useState<AgentAccount[]>([
    {
      id: 'agent_alpha',
      name: 'Alpha DeepSeek Reasoning Engine',
      publicKey: 'GCBZC5TOFMEZ6WXL5TDXAMKP7J5RIVHKYBMPHOYX6WR55UXBCLASC4DY',
      secretKey: DEFAULT_DEMO_SECRET,
      dailyBudget: 50.0,
      spentToday: 4.85,
      maxPerCall: 0.50,
      createdAt: Date.now() - 86400000,
      status: 'ACTIVE'
    },
    {
      id: 'agent_oracle',
      name: 'Soroban AMM Arbitrage Watchdog',
      publicKey: 'GD6ORACLEAGENT892347109283740192837401928374019283740',
      secretKey: 'SDEMOORACLESECRETKEYXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      dailyBudget: 20.0,
      spentToday: 1.20,
      maxPerCall: 0.05,
      createdAt: Date.now() - 43200000,
      status: 'ACTIVE'
    },
    {
      id: 'agent_crawler',
      name: 'Real-Time Web Intelligence Scout',
      publicKey: 'GACRAWLERAGENT726354819237461928374619283746192837461',
      secretKey: 'SDEMOCRAWLERSECRETKEYXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      dailyBudget: 15.0,
      spentToday: 0.40,
      maxPerCall: 0.05,
      createdAt: Date.now() - 21600000,
      status: 'ACTIVE'
    }
  ]);

  const refreshBalances = async (addr: string) => {
    try {
      const b = await fetchAccountBalances(addr);
      if (b && b.length > 0) {
        setBalances(b);
      }
    } catch (e) {
      console.warn('Could not fetch balances from horizon:', e);
    }
  };

  useEffect(() => {
    if (currentAddress) {
      refreshBalances(currentAddress);
    }
  }, [currentAddress]);

  const handleRecordPayment = (agentId: string, amount: number) => {
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        return { ...a, spentToday: +(a.spentToday + amount).toFixed(4) };
      }
      return a;
    }));
  };

  const handleAddAgent = (newAgent: AgentAccount) => {
    setAgents(prev => [newAgent, ...prev]);
  };

  const handleToggleAgentStatus = (agentId: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        return { ...a, status: a.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' };
      }
      return a;
    }));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top sticky navigation bar */}
      <Navbar
        currentAddress={currentAddress}
        balances={balances}
        onOpenWalletModal={() => setIsWalletOpen(true)}
        onOpenFaucetModal={() => setIsFaucetOpen(true)}
      />

      <main style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '0 1.5rem 3rem 1.5rem', flex: 1 }}>
        {/* Hero Section */}
        <div className="glass-panel" style={{
          padding: '2.5rem 2rem',
          margin: '1.5rem 0',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(13, 20, 41, 0.85) 0%, rgba(20, 31, 61, 0.9) 100%)'
        }}>
          {/* Subtle Astrolabe Ring Watermark SVG */}
          <div style={{ position: 'absolute', right: '-40px', top: '-40px', opacity: 0.05, pointerEvents: 'none' }}>
            <Compass size={320} color="#f59e0b" />
          </div>

          <div style={{ maxWidth: '820px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <span className="badge badge-gold">
                <Sparkles size={12} />
                <span>Next-Gen Machine-to-Machine Infrastructure</span>
              </span>
              <span className="badge badge-cyan">
                <span>Soroban Protocol 22</span>
              </span>
            </div>

            <h1 className="font-heading" style={{ fontSize: '2.3rem', fontWeight: 900, lineHeight: 1.2, marginBottom: '0.85rem', color: '#ffffff' }}>
              Autonomous AI Agent Payments & Reverse Proxy on <span style={{ color: 'var(--gold-400)' }}>Stellar</span>
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
              AstrolabePay transforms traditional web APIs into autonomous, paid intelligence streams using the HTTP 402 protocol,
              cryptographic on-chain spend policy verification, and zero-gas fee-bump envelopes natively built for Stellar Soroban.
            </p>

            {/* Quick Metrics Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1.25rem'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>SETTLED AI INVOCATIONS</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                  598,440
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>SETTLEMENT VOLUME</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-400)', fontFamily: 'var(--font-heading)' }}>
                  14,290 XLM
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AVG LATENCY / CALL</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--cyan-400)', fontFamily: 'var(--font-heading)' }}>
                  180ms
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ON-CHAIN VERIFICATION</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald-400)', fontFamily: 'var(--font-heading)' }}>
                  100% Soroban
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2rem',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}>
          {[
            { id: 'simulator', label: 'Agent 402 Simulator', icon: Cpu },
            { id: 'agents', label: 'Sub-Agent Fleet', icon: Bot },
            { id: 'providers', label: 'API Provider Registry', icon: Server },
            { id: 'sdk', label: 'Developer SDK & Tools', icon: FileCode },
            { id: 'architecture', label: 'SwyftPay Review & Teardown', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab View */}
        <div>
          {activeTab === 'simulator' && (
            <AgentSimulator agents={agents} onRecordPayment={handleRecordPayment} />
          )}

          {activeTab === 'agents' && (
            <AgentManager
              agents={agents}
              onAddAgent={handleAddAgent}
              onToggleStatus={handleToggleAgentStatus}
              onUpdateBudget={() => {}}
            />
          )}

          {activeTab === 'providers' && <ProviderRegistry />}

          {activeTab === 'sdk' && <CodeSnippets />}

          {activeTab === 'architecture' && <ArchitectureView />}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(5, 8, 20, 0.95)',
        padding: '2rem 1.5rem',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={18} color="var(--gold-400)" />
            <span style={{ fontWeight: 600, color: '#ffffff' }}>AstrolabePay</span>
            <span>— The Navigational Payment Engine for Autonomous AI Agents on Stellar Soroban</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <a
              href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <span>Testnet Contract</span>
              <ExternalLink size={12} />
            </a>
            <a
              href="https://github.com/Stellar-Starfare/AstrolabePay"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <span>GitHub Repository</span>
              <ExternalLink size={12} />
            </a>
            <a
              href="https://developers.stellar.org/docs/learn/smart-contract-internals"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <span>Stellar Soroban Docs</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        currentAddress={currentAddress}
        onSelectAccount={(pk, sk) => {
          setCurrentAddress(pk);
          setCurrentSecret(sk);
          refreshBalances(pk);
        }}
      />

      <FaucetModal
        isOpen={isFaucetOpen}
        onClose={() => setIsFaucetOpen(false)}
        targetAddress={currentAddress}
        onFundSuccess={() => {
          setTimeout(() => refreshBalances(currentAddress), 1500);
        }}
      />
    </div>
  );
};
