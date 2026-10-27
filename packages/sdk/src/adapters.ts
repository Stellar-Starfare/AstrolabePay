import { AstrolabeClient } from './client';

export class AstrolabeLangChainTool {
  constructor(private client: AstrolabeClient) {}

  name = 'astrolabe_pay_request';
  description = 'Executes an HTTP request to an API endpoint and autonomously settles fee-sponsored payments on Stellar if challenged with HTTP 402';

  async invoke(input: { url: string; method?: string; body?: any }) {
    return this.client.request(input.url, {
      method: input.method || 'GET',
      body: input.body,
    });
  }

  toToolDefinition() {
    return {
      type: 'function',
      function: {
        name: this.name,
        description: this.description,
        parameters: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'The API endpoint URL to call' },
            method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'], default: 'GET' },
            body: { type: 'object', description: 'Optional JSON payload for request' },
          },
          required: ['url'],
        },
      },
    };
  }
}

export function toOpenAITool(client: AstrolabeClient) {
  const tool = new AstrolabeLangChainTool(client);
  return {
    tool: tool.toToolDefinition(),
    handler: (args: { url: string; method?: string; body?: any }) => tool.invoke(args),
  };
}
