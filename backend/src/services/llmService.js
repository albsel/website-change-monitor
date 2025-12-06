const axios = require('axios');
const { diffTexts } = require('./diffService');

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Generate a human-readable explanation of changes between two texts.
 *
 * - Uses OpenAI if OPENAI_API_KEY is set and the API call succeeds.
 * - Falls back to internal diffSummary if the API is unavailable or fails.
 */
async function generateChangeExplanation(oldText, newText) {
  // Always compute our internal diff first
  const diffResult = diffTexts(oldText, newText);

  // If there are no changes, don't even call the LLM
  if (!diffResult.hasChanges) {
    return {
      explanation: diffResult.summary,
      usedFallback: true,
      model: null,
      meta: diffResult.meta
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;

  // If there is no API key, we must fall back
  if (!apiKey) {
    console.warn('[llmService] OPENAI_API_KEY not set — using fallback diff summary.');
    return {
      explanation: diffResult.summary,
      usedFallback: true,
      model: null,
      meta: diffResult.meta
    };
  }

  try {
    const prompt = `
You are a helpful assistant that explains changes between two versions of a web page.

Given the previous text and the new text, describe the main changes in a concise way.
Focus on sections added, removed, or significantly modified.

Return 3–6 bullet points, in plain text, no markdown syntax.

Previous version:
---
${oldText || '(empty)'}

New version:
---
${newText || '(empty)'}
`;

    const response = await axios.post(
      OPENAI_URL,
      {
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You explain differences between two versions of a webpage in concise bullet points.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 220,
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 8000 // 8 seconds
      }
    );

    const choice = response.data.choices?.[0];
    const explanation = choice?.message?.content?.trim();

    if (!explanation) {
      console.warn('[llmService] Empty response from OpenAI — using fallback diff summary.');
      return {
        explanation: diffResult.summary,
        usedFallback: true,
        model: DEFAULT_MODEL,
        meta: diffResult.meta
      };
    }

    return {
      explanation,
      usedFallback: false,
      model: DEFAULT_MODEL,
      meta: diffResult.meta
    };
  } catch (err) {
    console.error('[llmService] OpenAI call failed, using fallback diff summary:', err.message);

    return {
      explanation: diffResult.summary,
      usedFallback: true,
      model: DEFAULT_MODEL,
      meta: diffResult.meta,
      error: err.message
    };
  }
}

module.exports = {
  generateChangeExplanation
};
