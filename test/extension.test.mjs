import assert from 'node:assert/strict';
import test from 'node:test';

import elmModels, {
  ELM_API_BASE_URL,
  ELM_PROVIDER_ID,
  ELM_QWEN_MODEL_ID,
} from '../dist/index.js';

test('registers the production ELM Qwen provider', () => {
  let registration;
  elmModels({
    registerProvider(id, config) {
      registration = { id, config };
    },
  });

  assert.equal(registration.id, ELM_PROVIDER_ID);
  assert.equal(registration.config.name, 'University of Edinburgh ELM');
  assert.equal(registration.config.baseUrl, ELM_API_BASE_URL);
  assert.equal(registration.config.apiKey, '${ELM_API_KEY}');
  assert.equal(registration.config.api, 'openai-completions');

  const [model] = registration.config.models;
  assert.equal(model.id, ELM_QWEN_MODEL_ID);
  assert.equal(model.reasoning, true);
  assert.deepEqual(model.thinkingLevelMap, {
    off: 'none',
    minimal: null,
    low: null,
    medium: null,
    high: 'high',
    xhigh: null,
    max: null,
  });
  assert.deepEqual(model.input, ['text', 'image']);
  assert.equal(model.contextWindow, 262144);
  assert.equal(model.maxTokens, 81920);
  assert.deepEqual(model.compat, {
    maxTokensField: 'max_tokens',
    supportsReasoningEffort: true,
    thinkingFormat: 'qwen',
  });
});
