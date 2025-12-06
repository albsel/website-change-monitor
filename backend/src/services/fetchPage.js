const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Fetch a webpage and extract its readable text content.
 * Includes robust error handling for timeouts, network failures, etc.
 */
async function fetchPage(url) {
  if (!url) {
    throw new Error('fetchPage: URL is required');
  }

  try {
    const response = await axios.get(url, {
      timeout: 8000, // 8s timeout — good balance for PoC
      headers: {
        'User-Agent': 'WebsiteChangeMonitor/1.0'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    return {
      text,
      fetchedAt: new Date().toISOString()
    };

  } catch (err) {
    console.error(`[fetchPage] Failed to crawl ${url}:`, err.message);

    if (err.code === 'ECONNABORTED') {
      throw new Error(`Timeout while fetching ${url}`);
    }

    if (err.response) {
      throw new Error(`HTTP ${err.response.status} while fetching ${url}`);
    }

    throw new Error(`Failed to fetch ${url}: ${err.message}`);
  }
}

module.exports = {
  fetchPage
};
