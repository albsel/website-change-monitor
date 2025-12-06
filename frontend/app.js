const API_BASE = (() => {
    // For local dev from file:// or any host, we assume backend on localhost:3001
    // In Docker, we'll adjust to use the backend service name.
    return 'http://localhost:3001';
  })();
  
  const urlsListEl = document.getElementById('urls-list');
  const historyListEl = document.getElementById('history-list');
  const historyInfoEl = document.getElementById('history-info');
  
  let currentUrlId = null;
  
  function setHistoryInfo(message) {
    historyInfoEl.textContent = message;
  }
  
  function createUrlCard(urlItem) {
    const card = document.createElement('div');
    card.className = 'url-card';
  
    const title = document.createElement('div');
    title.className = 'url-title';
    title.textContent = urlItem.label || urlItem.url;
  
    const urlText = document.createElement('div');
    urlText.className = 'url-text';
    urlText.textContent = urlItem.url;
  
    const actions = document.createElement('div');
    actions.className = 'url-actions';
  
    const crawlBtn = document.createElement('button');
    crawlBtn.textContent = 'Crawl now';
    crawlBtn.className = 'btn btn-primary';
    crawlBtn.addEventListener('click', () => handleCrawl(urlItem.id));
  
    const historyBtn = document.createElement('button');
    historyBtn.textContent = 'View history';
    historyBtn.className = 'btn';
    historyBtn.addEventListener('click', () => loadHistory(urlItem.id, urlItem.label));
  
    actions.appendChild(crawlBtn);
    actions.appendChild(historyBtn);
  
    card.appendChild(title);
    card.appendChild(urlText);
    card.appendChild(actions);
  
    return card;
  }
  
  async function loadUrls() {
    urlsListEl.innerHTML = '<p>Loading URLs...</p>';
  
    try {
      const res = await fetch(`${API_BASE}/api/urls`);
  
      if (!res.ok) {
        throw new Error(`Failed to load URLs (status ${res.status})`);
      }
  
      const urls = await res.json();
  
      if (!Array.isArray(urls) || urls.length === 0) {
        urlsListEl.innerHTML = '<p>No URLs configured.</p>';
        return;
      }
  
      urlsListEl.innerHTML = '';
      urls.forEach((item) => {
        const card = createUrlCard(item);
        urlsListEl.appendChild(card);
      });
    } catch (err) {
      console.error('[frontend] Failed to load URLs:', err);
      urlsListEl.innerHTML = `<p class="error">Error loading URLs: ${err.message}</p>`;
    }
  }
  
  async function handleCrawl(id) {
    if (!id) return;
  
    setHistoryInfo('Crawling URL, please wait...');
  
    try {
      const res = await fetch(`${API_BASE}/api/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });
  
      if (!res.ok) {
        const msg = `Crawl failed (status ${res.status})`;
        console.error('[frontend] Crawl error:', msg);
        setHistoryInfo(msg);
        return;
      }
  
      const entry = await res.json();
      setHistoryInfo('Crawl finished. Latest change shown below.');
      // Reload history for this URL after successful crawl
      await loadHistory(id, entry.label);
    } catch (err) {
      console.error('[frontend] Crawl request failed:', err);
      setHistoryInfo(`Crawl request failed: ${err.message}`);
    }
  }
  
  async function loadHistory(id, label) {
    currentUrlId = id;
    historyListEl.innerHTML = '<p>Loading history...</p>';
  
    try {
      const res = await fetch(`${API_BASE}/api/history/${id}`);
  
      if (!res.ok) {
        const msg = `Failed to load history (status ${res.status})`;
        console.error('[frontend] History error:', msg);
        historyListEl.innerHTML = `<p class="error">${msg}</p>`;
        return;
      }
  
      const history = await res.json();
  
      if (!Array.isArray(history) || history.length === 0) {
        setHistoryInfo(`No history yet for "${label || 'selected URL'}".`);
        historyListEl.innerHTML = '<p>No entries yet.</p>';
        return;
      }
  
      setHistoryInfo(`Showing ${history.length} change(s) for "${label || 'selected URL'}".`);
  
      historyListEl.innerHTML = '';
  
      history.forEach((entry) => {
        const item = document.createElement('article');
        item.className = 'history-entry';
  
        const header = document.createElement('header');
        header.className = 'history-header';
  
        const title = document.createElement('div');
        title.className = 'history-title';
        title.textContent = new Date(entry.crawledAt).toLocaleString();
  
        const badge = document.createElement('span');
        badge.className = 'history-badge';
        badge.textContent = entry.usedFallback ? 'Fallback' : (entry.model || 'LLM');
  
        header.appendChild(title);
        header.appendChild(badge);
  
        const explanation = document.createElement('p');
        explanation.className = 'history-explanation';
        explanation.textContent = entry.explanation;
  
        const meta = document.createElement('div');
        meta.className = 'history-meta';
        const lengthDiff = entry.meta?.lengthDiff ?? 0;
        meta.textContent = `Length diff: ${lengthDiff} characters`;
  
        item.appendChild(header);
        item.appendChild(explanation);
        item.appendChild(meta);
  
        historyListEl.appendChild(item);
      });
    } catch (err) {
      console.error('[frontend] Failed to load history:', err);
      historyListEl.innerHTML = `<p class="error">Error loading history: ${err.message}</p>`;
    }
  }
  
  // Init on load
  window.addEventListener('DOMContentLoaded', () => {
    loadUrls();
  });
  