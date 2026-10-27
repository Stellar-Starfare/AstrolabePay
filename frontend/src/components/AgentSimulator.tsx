import React, { useState } from 'react';
import { Play, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Terminal, Cpu, Clock, RefreshCw, ExternalLink } from 'lucide-react';
import { AgentAccount, ServiceEndpoint, INITIAL_SERVICES, CONTRACT_ID } from '../lib/stellar';

interface AgentSimulatorProps {
  agents: AgentAccount[];
  onRecordPayment: (agentId: string, amount: number) => void;
}

export const AgentSimulator: React.FC<AgentSimulatorProps> = ({ agents, onRecordPayment }) => {
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState(INITIAL_SERVICES[0].id);
  const [userPrompt, setUserPrompt] = useState('Solve multi-step asset pricing curve for Soroban AMM liquidity pool.');
  const [isRunning, setIsRunning] = useState(false);
  const [executionStep, setExecutionStep] = useState<number>(0);
  const [logs, setLogs] = useState<Array<{ stage: string; message: string; timestamp: string; level: 'info' | 'success' | 'warn' }>>([]);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [responseOutput, setResponseOutput] = useState<string | null>(null);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];
  const selectedService = INITIAL_SERVICES.find(s => s.id === selectedServiceId) || INITIAL_SERVICES[0];

  const addLog = (stage: string, message: string, level: 'info' | 'success' | 'warn' = 'info') => {
    setLogs(prev => [
      ...prev,
      { stage, message, timestamp: new Date().toLocaleTimeString(), level }
    ]);
  };

  const handleRunSimulation = async () => {
    if (!selectedAgent || isRunning) return;
    setIsRunning(true);
    setLogs([]);
    setLastTxHash(null);
    setResponseOutput(null);
    setExecutionStep(1);

    // Step 1: Agent calls API
    addLog('AGENT', `Autonomous agent [${selectedAgent.name}] dispatching HTTP POST to ${selectedService.endpointUrl}`);
    await new Promise(r => setTimeout(r, 600));

    // Step 2: 402 Challenge
    setExecutionStep(2);
    addLog('INTERCEPTOR', `Received HTTP 402 Payment Required. Astrolabe Protocol v1 challenge detected.`, 'warn');
    addLog('CHALLENGE', `Amount: ${selectedService.costPerCall} ${selectedService.asset} | Nonce: ast_${Math.random().toString(36).substring(2, 10)}`);
    await new Promise(r => setTimeout(r, 700));

    // Step 3: Spend Policy Evaluation
    setExecutionStep(3);
    const wouldExceedDaily = (selectedAgent.spentToday + selectedService.costPerCall) > selectedAgent.dailyBudget;
    const exceedsMaxPerCall = selectedService.costPerCall > selectedAgent.maxPerCall;

    if (wouldExceedDaily || exceedsMaxPerCall) {
      addLog('POLICY', `VIOLATION: Spend policy rejected call. Daily spent: ${selectedAgent.spentToday}/${selectedAgent.dailyBudget} XLM`, 'warn');
      setIsRunning(false);
      setExecutionStep(0);
      return;
    }
    addLog('POLICY', `Spend Policy Guard: PASSED (Budget Remaining: ${(selectedAgent.dailyBudget - selectedAgent.spentToday).toFixed(2)} XLM)`, 'success');
    await new Promise(r => setTimeout(r, 600));

    // Step 4: Relayer Fee Sponsorship & Testnet Submission
    setExecutionStep(4);
    addLog('RELAYER', `Fee-Sponsored Relayer wrapping transaction with envelope fee-bump (0 base fee for agent)...`);
    await new Promise(r => setTimeout(r, 900));

    const simulatedHash = '9b7351a5434e40dd1e572662c430bb796c42d8205aa18653b629802856647fe7';
    setLastTxHash(simulatedHash);
    addLog('CONTRACT', `Soroban contract ${CONTRACT_ID.substring(0, 8)}... confirmed settlement on Stellar Testnet!`, 'success');
    onRecordPayment(selectedAgent.id, selectedService.costPerCall);
    await new Promise(r => setTimeout(r, 500));

    // Step 5: Upstream Streaming Delivery
    setExecutionStep(5);
    addLog('UPSTREAM', `Edge proxy streamed verified 200 OK response with cryptographically signed receipt.`);
    setResponseOutput(JSON.stringify({
      status: "success",
      model: selectedService.name,
      result: {
        reasoning_trace: "1. Verified pool reserves on Stellar ledger #4921092.\n2. Invariant constant-product k = x * y validated.\n3. Estimated slip: 0.0014% with 99.98% confidence interval.",
        tokens_computed: 512,
        settlement: {
          asset: selectedService.asset,
          cost: selectedService.costPerCall,
          relayer_sponsored: true,
          stellar_tx: simulatedHash
        }
      }
    }, null, 2));

    setIsRunning(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(380px, 1.4fr)', gap: '1.5rem', alignItems: 'start' }}>
      {/* Left Control Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Cpu color="var(--gold-400)" size={20} />
          <h2 style={{ fontSize: '1.15rem', color: '#ffffff' }}>Agent Dispatch Controls</h2>
        </div>

        {/* Select Agent */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>
            Active AI Sub-Agent
          </label>
          <select
            className="input-field"
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            disabled={isRunning}
          >
            {agents.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} (Budget: {a.spentToday.toFixed(2)} / {a.dailyBudget} XLM)
              </option>
            ))}
          </select>
          {selectedAgent && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Per-call Limit: {selectedAgent.maxPerCall} XLM</span>
              <span style={{ color: selectedAgent.status === 'ACTIVE' ? 'var(--emerald-400)' : 'var(--rose-400)' }}>
                ● {selectedAgent.status}
              </span>
            </div>
          )}
        </div>

        {/* Select Service */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>
            Target Paid API Service (HTTP 402 Protected)
          </label>
          <select
            className="input-field"
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            disabled={isRunning}
          >
            {INITIAL_SERVICES.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.costPerCall} {s.asset}
              </option>
            ))}
          </select>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {selectedService.description}
          </div>
        </div>

        {/* Input Prompt */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>
            Autonomous Request Payload
          </label>
          <textarea
            className="input-field"
            rows={3}
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            disabled={isRunning}
            style={{ resize: 'none' }}
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleRunSimulation}
          disabled={isRunning || !selectedAgent}
          className="btn-gold"
          style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
        >
          {isRunning ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Executing Autonomous Payment Cycle...</span>
            </>
          ) : (
            <>
              <Play size={16} />
              <span>Simulate Autonomous AI 402 Payment</span>
            </>
          )}
        </button>

        {/* Pipeline Stepper */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
            X402 PROTOCOL SETTLEMENT PIPELINE
          </div>
          {[
            { step: 1, label: 'HTTP 402 Detection & Interception' },
            { step: 2, label: 'Challenge Nonce & Payload Extraction' },
            { step: 3, label: 'Client-Side Spend Policy Guard' },
            { step: 4, label: 'Fee-Sponsored Soroban Settlement' },
            { step: 5, label: 'Reverse Proxy Upstream Delivery' },
          ].map(s => {
            const isDone = executionStep > s.step;
            const isCurrent = executionStep === s.step;
            return (
              <div
                key={s.step}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  fontSize: '0.8rem',
                  padding: '0.35rem 0',
                  color: isCurrent ? 'var(--gold-400)' : isDone ? 'var(--emerald-400)' : 'var(--text-muted)',
                  fontWeight: isCurrent ? 600 : 400
                }}
              >
                {isDone ? (
                  <CheckCircle2 size={15} color="var(--emerald-400)" />
                ) : isCurrent ? (
                  <div className="pulse-dot" style={{ width: '10px', height: '10px' }} />
                ) : (
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#334155' }} />
                )}
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Terminal & Telemetry */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal color="var(--cyan-400)" size={18} />
            <h3 style={{ fontSize: '0.95rem', color: '#ffffff' }}>Live Protocol Telemetry Log</h3>
          </div>
          <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>Real-time Feed</span>
        </div>

        {/* Terminal logs window */}
        <div style={{
          background: '#040714',
          borderRadius: '8px',
          padding: '1rem',
          minHeight: '260px',
          maxHeight: '320px',
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          border: '1px solid var(--border-subtle)'
        }}>
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', paddingTop: '4rem', textAlign: 'center' }}>
              Press "Simulate Autonomous AI 402 Payment" to observe the live x402 challenge, policy evaluation, and Soroban settlement.
            </div>
          ) : (
            logs.map((l, i) => (
              <div key={i} style={{ marginBottom: '0.4rem', lineHeight: '1.4' }}>
                <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>[{l.timestamp}]</span>
                <span style={{
                  color: l.level === 'success' ? 'var(--emerald-400)' : l.level === 'warn' ? 'var(--gold-400)' : 'var(--cyan-400)',
                  fontWeight: 600,
                  marginRight: '0.5rem'
                }}>
                  [{l.stage}]
                </span>
                <span style={{ color: l.level === 'warn' ? '#fde047' : '#e2e8f0' }}>{l.message}</span>
              </div>
            ))
          )}
        </div>

        {/* On-Chain Receipt Box */}
        {lastTxHash && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--emerald-400)" />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--emerald-400)' }}>Testnet Soroban Payment Settled</div>
                <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                  Tx: {lastTxHash.substring(0, 24)}...
                </div>
              </div>
            </div>
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${lastTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', gap: '0.3rem' }}
            >
              <span>View On-Chain</span>
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        {/* Response JSON Output */}
        {responseOutput && (
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              DECODED UPSTREAM RECEIPT PAYLOAD
            </div>
            <pre style={{
              background: '#040714',
              borderRadius: '8px',
              padding: '0.85rem',
              color: 'var(--emerald-400)',
              fontSize: '0.74rem',
              border: '1px solid var(--border-subtle)',
              overflowX: 'auto',
              maxHeight: '180px'
            }}>
              {responseOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
