const axios = require('axios');
const { stripHtml } = require('../utils/stripHtml');

async function fetchPage(url) {
  try {
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (WebsiteChangeMonitor PoC)'
      }
    });

    let text = stripHtml(response.data);

    // Trim extremely large pages
    if (text.length > 50000) {
      text = text.slice(0, 50000);
    }

    return {
      text,
      fetchedAt: new Date().toISOString()
    };

  } catch (err) {
    console.error(`[fetchPage] Failed to crawl ${url}:`, err.message);

    if (err.code === 'ECONNABORTED') {
      throw new Error(`Timeout while fetching ${url}`);
    }

    throw new Error(`Failed to fetch URL: ${err.message}`);
  }
}

module.exports = { fetchPage };
