const crypto = require('crypto');

/**
 * Create a stable, filesystem-safe hash from a URL.
 * We use sha1 here – more than enough for this PoC.
 */
function hashUrl(url) {
  if (typeof url !== 'string' || !url.trim()) {
    throw new Error('Invalid URL for hashing');
  }

  return crypto.createHash('sha1').update(url).digest('hex');
}

module.exports = {
  hashUrl
};
