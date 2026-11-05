import { AstrolabeClient } from './client';

export interface AstrolabeToolOptions {
  name: string;
  description: string;
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  inputSchema?: Record<string, any>;
}

export interface OpenAIFunctionDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

export interface AstrolabeOpenAIToolResult {
  definition: OpenAIFunctionDefinition;
  execute: (args?: Record<string, any>) => Promise<any>;
  handler: (args?: Record<string, any>) => Promise<any>;
}

export class AstrolabeLangChainTool {
  name: string;
  description: string;
  private endpoint?: string;
  private defaultMethod: string;

  constructor(
    private client: AstrolabeClient,
    options?: Partial<AstrolabeToolOptions>
  ) {
    this.name = options?.name || 'astrolabe_pay_request';
    this.description =
      options?.description ||
      'Executes an HTTP request to an API endpoint and autonomously settles fee-sponsored payments on Stellar if challenged with HTTP 402';
    this.endpoint = options?.endpoint;
    this.defaultMethod = options?.method || 'POST';
  }

  async invoke(input: { url?: string; method?: string; body?: any; [key: string]: any }) {
    const targetUrl = this.endpoint || input.url;
    if (!targetUrl) {
      throw new Error('AstrolabeLangChainTool: No target URL or endpoint specified');
    }

    const method = input.method || (this.endpoint ? this.defaultMethod : 'GET');
    const body = input.body !== undefined ? input.body : (this.endpoint && method !== 'GET' ? input : undefined);

    return this.client.request(targetUrl, {
      method,
      body,
    });
  }

  async call(input: any) {
    return this.invoke(input);
  }

  toToolDefinition(): OpenAIFunctionDefinition {
    return {
      type: 'function',
      function: {
        name: this.name,
        description: this.description,
        parameters: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'The API endpoint URL to call' },
            method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'], default: 'POST' },
            body: { type: 'object', description: 'Optional JSON payload for request' },
          },
          required: this.endpoint ? [] : ['url'],
        },
      },
    };
  }
}

/**
 * Creates a drop-in LangChain compatible tool bound to an AstrolabeClient and protected endpoint.
 */
export function createAstrolabeLangChainTool(
  client: AstrolabeClient,
  options: AstrolabeToolOptions
): AstrolabeLangChainTool {
  return new AstrolabeLangChainTool(client, options);
}

/**
 * Creates an OpenAI Function Calling tool descriptor and execution handler.
 */
export function createAstrolabeOpenAITool(
  client: AstrolabeClient,
  options: AstrolabeToolOptions
): AstrolabeOpenAIToolResult {
  const tool = new AstrolabeLangChainTool(client, options);
  const handler = async (args?: Record<string, any>) => {
    return tool.invoke(args || {});
  };

  return {
    definition: tool.toToolDefinition(),
    execute: handler,
    handler,
  };
}

/**
 * Legacy OpenAI Tool generator for generic endpoints.
 */
export function toOpenAITool(client: AstrolabeClient) {
  const tool = new AstrolabeLangChainTool(client);
  return {
    tool: tool.toToolDefinition(),
    handler: (args: { url: string; method?: string; body?: any }) => tool.invoke(args),
  };
}
