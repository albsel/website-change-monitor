const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const HISTORY_DIR = path.join(DATA_DIR, 'history');

/**
 * Safely read a JSON file and parse it.
 * Throws a descriptive error if something goes wrong.
 */
function readJson(relativePath) {
  const fullPath = path.join(DATA_DIR, relativePath);

  try {
    const raw = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[fileStore] Failed to read JSON from ${fullPath}:`, err.message);
    const error = new Error('Failed to read data store');
    error.cause = err;
    throw error;
  }
}

/**
 * Ensure that the history directory exists.
 */
function ensureHistoryDir() {
  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
  }
}

/**
 * Append a history entry for a given URL hash.
 * The file will be: data/history/<urlHash>.json
 * The structure is a simple array of entries.
 */
function appendHistoryEntry(urlHash, entry) {
  ensureHistoryDir();
  const historyFile = path.join(HISTORY_DIR, `${urlHash}.json`);

  let existing = [];
  if (fs.existsSync(historyFile)) {
    try {
      const raw = fs.readFileSync(historyFile, 'utf-8');
      existing = JSON.parse(raw);
      if (!Array.isArray(existing)) {
        existing = [];
      }
    } catch (err) {
      console.error(`[fileStore] Failed to read existing history for ${urlHash}:`, err.message);
      existing = [];
    }
  }

  const updated = [...existing, entry];

  try {
    fs.writeFileSync(historyFile, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[fileStore] Failed to write history for ${urlHash}:`, err.message);
    const error = new Error('Failed to persist history entry');
    error.cause = err;
    throw error;
  }
}

/**
 * Read the history for a given URL hash.
 * Returns an array of history entries.
 */
function readHistory(urlHash) {
    ensureHistoryDir();
    const historyFile = path.join(HISTORY_DIR, `${urlHash}.json`);
  
    if (!fs.existsSync(historyFile)) {
      return [];
    }
  
    try {
      const raw = fs.readFileSync(historyFile, 'utf-8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error(`[fileStore] Failed to read history for ${urlHash}:`, err.message);
      return [];
    }
  }
  

module.exports = {
  readJson,
  appendHistoryEntry,
  readHistory
};
