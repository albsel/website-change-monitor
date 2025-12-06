const express = require('express');
const { readJson } = require('../utils/fileStore');
const { hashUrl } = require('../utils/hash');

const router = express.Router();

/**
 * GET /api/urls
 * Returns the list of monitored URLs with stable IDs.
 */
router.get('/', (req, res, next) => {
  try {
    const sites = readJson('sites.json');

    const payload = sites.map((site) => ({
      id: hashUrl(site.url),
      url: site.url,
      label: site.label || site.url
    }));

    res.json(payload);
  } catch (err) {
    console.error('[urls] Failed to load URL list:', err.message);
    next(err);
  }
});

module.exports = router;
