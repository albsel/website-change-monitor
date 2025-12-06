const axios = require('axios');
const { generateChangeExplanation } = require('../src/services/llmService');

jest.mock('axios');

describe('LLM fallback behavior', () => {
  it('uses fallback summary when OpenAI request fails', async () => {
    axios.post.mockRejectedValue(new Error('OpenAI down'));

    const oldText = 'Hello world';
    const newText = 'Hello brave new world';

    const result = await generateChangeExplanation(oldText, newText);

    expect(result.usedFallback).toBe(true);
    expect(result.explanation.toLowerCase()).toContain('changed');
  });
});
