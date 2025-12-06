const express = require('express');
const { readJson, readHistory, appendHistoryEntry } = require('../utils/fileStore');
const { hashUrl } = require('../utils/hash');
const { fetchPage } = require('../services/fetchPage');
const { generateChangeExplanation } = require('../services/llmService');

const router = express.Router();

/**
 * POST /api/crawl
 * Body: { id: string }  // the hashed URL id
 *
 * Steps:
 *  - find URL in sites.json by id
 *  - fetch current page text
 *  - load last snapshot from history
 *  - generate change explanation (LLM + fallback)
 *  - store new history entry
 *  - return entry as response
 */
router.post('/', async (req, res, next) => {
  const { id } = req.body || {};

  if (!id) {
    return res.status(400).json({ error: 'Missing id in request body' });
  }

  try {
    // 1) Load sites and find matching one
    const sites = readJson('sites.json');
    const site = sites.find((s) => hashUrl(s.url) === id);

    if (!site) {
      return res.status(404).json({ error: 'Unknown URL id' });
    }

    // 2) Fetch current page content
    const currentSnapshot = await fetchPage(site.url);

    // 3) Load history and get previous snapshot text (if any)
    const history = readHistory(id);
    const lastEntry = history[history.length - 1];
    const previousText = lastEntry?.snapshot?.text || '';

    // 4) Generate explanation via LLM (+ fallback)
    const llmResult = await generateChangeExplanation(previousText, currentSnapshot.text);

    const entry = {
      id,
      url: site.url,
      label: site.label || site.url,
      crawledAt: currentSnapshot.fetchedAt,
      explanation: llmResult.explanation,
      usedFallback: llmResult.usedFallback,
      model: llmResult.model,
      meta: llmResult.meta,
      snapshot: {
        text: currentSnapshot.text,
        fetchedAt: currentSnapshot.fetchedAt
      }
    };

    // 5) Persist to history
    appendHistoryEntry(id, entry);

    // 6) Respond
    res.status(201).json(entry);
  } catch (err) {
    console.error('[crawl] Failed to crawl and process URL:', err.message);
    next(err);
  }
});

module.exports = router;
