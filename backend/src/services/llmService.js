const axios = require('axios');
const { diffTexts } = require('./diffService');

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

// Trim very large pages for stable OpenAI usage
const MAX_CHARS = 50000;

/**
 * Generate a human-readable explanation of changes between two texts.
 * Uses OpenAI if possible, otherwise falls back with explicit reason.
 */
async function generateChangeExplanation(oldText, newText) {
  const diffResult = diffTexts(oldText, newText);

  // 1) No changes at all → skip OpenAI, required behavior
  if (!diffResult.hasChanges) {
    return {
      explanation: diffResult.summary,
      usedFallback: true,
      model: null,
      reason: 'No textual changes detected',
      meta: diffResult.meta
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;

  // 2) No API key provided
  if (!apiKey) {
    console.warn('[llmService] OPENAI_API_KEY not set — using fallback.');
    return {
      explanation: diffResult.summary,
      usedFallback: true,
      model: null,
      reason: 'OPENAI_API_KEY not set',
      meta: diffResult.meta
    };
  }

  // 3) Trim very large pages (Wikipedia, BBC)
  const oldTrimmed = (oldText || '').slice(0, MAX_CHARS);
  const newTrimmed = (newText || '').slice(0, MAX_CHARS);

  try {
    const prompt = `
Explain the differences between two versions of a web page.
Focus ONLY on meaningful textual changes.
Return 3–6 short bullet points.

OLD:
---
${oldTrimmed || '(empty)'}

NEW:
---
${newTrimmed || '(empty)'}
`;

    const response = await axios.post(
      OPENAI_URL,
      {
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: 'You summarize textual differences between webpage versions.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 220,
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 8000
      }
    );

    const choice = response.data.choices?.[0];
    const explanation = choice?.message?.content?.trim();

    if (!explanation) {
      console.warn('[llmService] Empty OpenAI response — fallback');
      return {
        explanation: diffResult.summary,
        usedFallback: true,
        model: DEFAULT_MODEL,
        reason: 'OpenAI returned empty response',
        meta: diffResult.meta
      };
    }

    return {
      explanation,
      usedFallback: false,
      model: DEFAULT_MODEL,
      reason: null,
      meta: diffResult.meta
    };

  } catch (err) {
    console.error('[llmService] OpenAI call failed:', err.message);

    return {
      explanation: diffResult.summary,
      usedFallback: true,
      model: DEFAULT_MODEL,
      reason: `OpenAI error: ${err.message}`,
      meta: diffResult.meta
    };
  }
}

module.exports = {
  generateChangeExplanation
};
