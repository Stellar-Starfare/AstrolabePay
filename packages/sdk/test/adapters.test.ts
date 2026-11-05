import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Keypair } from '@stellar/stellar-sdk';
import { AstrolabeClient } from '../src/client';
import { createAstrolabeLangChainTool, createAstrolabeOpenAITool } from '../src/adapters';

describe('AI Framework Adapters', () => {
  const dummyKey = Keypair.random().secret();
  const client = new AstrolabeClient({
    agentSecretKey: dummyKey,
  });

  it('createAstrolabeLangChainTool should construct valid tool with metadata', () => {
    const tool = createAstrolabeLangChainTool(client, {
      name: 'deepseek_reasoner',
      description: 'Paid reasoning engine',
      endpoint: 'https://proxy.astrolabe.stellar.network/v1/deepseek',
    });

    assert.strictEqual(tool.name, 'deepseek_reasoner');
    assert.strictEqual(tool.description, 'Paid reasoning engine');
    assert.strictEqual(typeof tool.invoke, 'function');

    const def = tool.toToolDefinition();
    assert.strictEqual(def.type, 'function');
    assert.strictEqual(def.function.name, 'deepseek_reasoner');
  });

  it('createAstrolabeOpenAITool should return definition and execution handler', () => {
    const openAiTool = createAstrolabeOpenAITool(client, {
      name: 'market_oracle',
      description: 'Stellar DEX oracle',
      endpoint: 'https://proxy.astrolabe.stellar.network/v1/oracle',
    });

    assert.strictEqual(openAiTool.definition.type, 'function');
    assert.strictEqual(openAiTool.definition.function.name, 'market_oracle');
    assert.strictEqual(typeof openAiTool.execute, 'function');
  });
});
