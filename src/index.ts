import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';

export const ELM_PROVIDER_ID = 'elm';
export const ELM_API_BASE_URL = 'https://elm.edina.ac.uk/api/v1';
export const ELM_QWEN_MODEL_ID = 'Qwen/Qwen3.5-397B-A17B-FP8';

export default function elmModels(pi: ExtensionAPI): void {
  pi.registerProvider(ELM_PROVIDER_ID, {
    name: 'University of Edinburgh ELM',
    baseUrl: ELM_API_BASE_URL,
    apiKey: '${ELM_API_KEY}',
    api: 'openai-completions',
    models: [
      {
        id: ELM_QWEN_MODEL_ID,
        name: 'Qwen 3.5 397B',
        reasoning: true,
        input: ['text', 'image'],
        cost: {
          input: 0.5,
          output: 3.5,
          cacheRead: 0,
          cacheWrite: 0,
        },
        contextWindow: 262144,
        maxTokens: 81920,
        compat: {
          maxTokensField: 'max_tokens',
          thinkingFormat: 'qwen',
        },
      },
    ],
  });
}
