# Website Change Monitor
# Website Change Monitor (PoC)

A small proof-of-concept **website change monitor** that tracks content updates on a few URLs and uses an LLM to generate human-readable explanations of the changes.

The goal is not production code, but a clean, well-structured PoC that demonstrates:

- basic crawling
- resilient error handling
- LLM integration with fallback
- minimal but usable frontend
- fully dockerized setup

---

## Features

- **URL management**  
  A small JSON config (`backend/data/sites.json`) defines 3–5 URLs to monitor.  
  Each URL is exposed as an ID via `GET /api/urls` for the frontend.

- **Crawling**  
  `POST /api/crawl`:
  - fetches the page via `axios`
  - extracts text using `cheerio`
  - compares the new text with the last snapshot

- **LLM-based change explanation**  
  The backend calls the OpenAI Chat Completions API to describe the change in plain language (short bullet-style explanation).

- **Robust fallback**  
  If the LLM is not available (no API key, timeout, network error, bad response), the app falls back to an internal diff summary from `diffService.js`.  
  The system is always usable, with or without the LLM.

- **History**  
  Every crawl is stored as a JSON entry in `backend/data/history/<urlHash>.json`, including:
  - timestamp
  - explanation (LLM or fallback)
  - meta (length diff, ratio)
  - raw text snapshot

- **Minimal frontend**  
  A small single-page UI (static HTML + vanilla JS):
  - shows the list of monitored URLs
  - lets you trigger “Crawl now”
  - displays the change history per URL

---

## Tech Stack

- **Backend:** Node.js, Express, axios, cheerio, Jest  
- **Frontend:** Static HTML, vanilla JS, minimal CSS, served via nginx  
- **LLM:** OpenAI Chat Completions API (model configurable via `OPENAI_MODEL`)  
- **Containerization:** Docker, docker-compose

---

## Architecture Overview

```text
frontend (nginx, port 3000)  --->  backend (Node/Express, port 3001)
                                      |
                                      +--> axios: fetch page HTML
                                      +--> cheerio: extract text
                                      +--> diffService: basic diff + metadata
                                      +--> llmService: OpenAI + fallback
                                      +--> fileStore: JSON-based storage (sites + history)
