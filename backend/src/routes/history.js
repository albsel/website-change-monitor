const express = require('express');
const { readHistory } = require('../utils/fileStore');

const router = express.Router();

/**
 * GET /api/history/:id
 * Returns the change history for a given URL id.
 */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  try {
    const history = readHistory(id);

    // For clarity in the UI, return newest first
    const sorted = [...history].reverse();

    res.json(sorted);
  } catch (err) {
    console.error('[history] Failed to load history:', err.message);
    next(err);
  }
});

module.exports = router;
