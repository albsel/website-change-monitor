# Website Change Monitor – Proof of Concept

Ein minimaler, vollständig containerisierter Website-Change-Monitor mit KI-gestützter Änderungsbeschreibung.

## Features

- Webseitenliste (3–5 Seiten) als Config
- Manuelles Crawling per Endpoint
- KI-gestützte Änderungsbeschreibung (OpenAI) mit automatischem Fallback
- Frontend zur Anzeige der Historie
- Docker-Compose-Setup für sofortige Ausführung
- Tests (Jest)

## Quick Start

**Voraussetzungen:**
- Docker + Docker Compose
- Optional: OpenAI API Key

**Starten:**
```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

**OpenAI aktivieren:**
```bash
export OPENAI_API_KEY=sk-xxxx
```
Ohne API-Key → automatischer Fallback (internes Diff).

## Konfiguration

Webseiten definiert in `backend/data/sites.json`:
```json
[
  { "url": "https://news.ycombinator.com/", "label": "Hacker News" },
  { "url": "https://www.bbc.com/news", "label": "BBC News" }
]
```

## Architektur

**Backend (Node.js + Express):**
- `/api/urls` - Liste der überwachten URLs
- `/api/crawl` - Crawling triggern (POST mit `{ id }`)
- `/api/history/:id` - Änderungshistorie abrufen
- Services: `fetchPage`, `llmService` (OpenAI + Fallback), `diffService`
- Persistenz: JSON-Dateien in `backend/data/history/`

**Frontend:**
- Plain JS + CSS, ausgeliefert über Nginx
- URL-Liste, Crawling-Trigger, Historie-Anzeige

## Technische Entscheidungen

- **Express**: Schnelle PoC-Implementierung, minimale Boilerplate
- **Axios**: Stabileres Timeout-Handling als fetch
- **Cheerio**: Leichtgewichtig, schnelle Text-Extraktion ohne Browser-Simulation
- **JSON-File-Storage**: Einfache Persistenz für PoC, gut prüfbar
- **Plain JS Frontend**: Kein Build-Schritt, Reviewer sehen Logik direkt

## Fehlerbehandlung

- HTTP-Fehler beim Crawling → saubere Fehlermeldungen
- LLM-Ausfall → automatischer Fallback auf internes Diff
- Timeouts: OpenAI 8000ms, max 50.000 Zeichen pro Text

## Tests

```bash
cd backend
npm test
```

Tests: `llmService.test.js`, `fetchPage.test.js`

## KI-Einsatz

Entwicklung mit KI-Tools unterstützt (ChatGPT/Claude/Cursor):
- Architekturplanung
- Diff-Algorithmus-Design
- Fehlermeldungen & Timeout-Handling
- OpenAI-Prompt-Engineering
- Refactoring & Dokumentation

KI als Pair-Programmer eingesetzt – alle Vorschläge wurden überprüft und angepasst.

## Workflow

1. URL auswählen
2. "Crawl now" klicken
3. Backend lädt HTML, extrahiert Text
4. Diff wird berechnet
5. LLM erstellt Änderungserklärung (oder Fallback)
6. Ergebnis erscheint im UI
7. Einträge gespeichert in `backend/data/history/<id>.json`

## Erfüllung der Anforderungen

| Anforderung | Umsetzung |
|------------|-----------|
| Webseiten-Verwaltung | `sites.json` + UI |
| Crawling | POST `/api/crawl` |
| KI-Vergleich | `llmService` mit OpenAI + Fallback |
| Anzeige | Frontend listet URLs & Historie |
| Docker-Compose | Single-command startup |
| Tests | llmService + fetchPage |
| Error Handling | HTTP-Fehler, Timeouts, Fallback |
| KI-Dokumentation | Kapitel im README |

## Lizenz

MIT – frei nutzbar für i-gelb Proof-of-Concept Bewertung.
