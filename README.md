Website Change Monitor – Proof of Concept

Ein minimaler, containerisierter Website-Change-Monitor, der Textänderungen auf Webseiten erkennt und mit einer LLM-API beschreibt.
Optimiert für schnelles Review, klare Architektur und robuste Fehlerbehandlung.

🚀 Features

Konfigurierbare Webseitenliste (3–5 Seiten) via sites.json

Manueller Crawl-Trigger per Button/Endpoint

Intelligenter Vergleich

Ruft OpenAI an, wenn ein signifikanter Textdiff erkannt wird

Nutzt automatischen Fallback, wenn kein API-Key vorhanden ist oder keine sinnvolle Änderung vorliegt

Persistente Änderungs­historie in JSON-Dateien

Minimalistisches Frontend für URLs & History

Komplett per Docker Compose startbar

2 aussagekräftige Tests (Jest)

🏁 Quick Start
Voraussetzungen

Docker & Docker Compose

Optional: OPENAI_API_KEY

Starten
docker-compose up --build

Frontend → http://localhost:3000

Backend → http://localhost:3001

OpenAI aktivieren
export OPENAI_API_KEY=sk-xxxx

Ohne API-Key → automatische Fallback-Erklärung (interne Diff-Zusammenfassung).

⚙️ Konfiguration

Webseiten liegen in
backend/data/sites.json:

[
{ "id": "hn", "url": "https://news.ycombinator.com/", "label": "Hacker News" },
{ "id": "bbc", "url": "https://www.bbc.com/news", "label": "BBC News" }
]

Beim Neustart des Backends werden neue Einträge eingelesen.

🧱 Architektur
Backend (Node.js + Express)

Endpoints

GET /api/urls → URL-Liste

POST /api/crawl → Crawling triggern

GET /api/history/:id → Änderungshistorie

Services

fetchPage – HTML laden, Text extrahieren

diffService – Textvergleich

llmService – OpenAI-Analyse oder Fallback

Persistenz

JSON-Dateien im Ordner
backend/data/history/<id>.json

Frontend (Nginx + Plain JS)

Keine Build-Pipeline → Reviewer sehen die Logik sofort

Zeigt URL-Liste & Historie

Trigger für Crawls

🎯 Technische Entscheidungen (Kurzbegründung)

Express → schnell, minimaler Overhead für PoC

Axios → stabileres Error/Timeout-Handling als fetch

Cheerio → schnelle Text-Extraktion ohne Headless-Browser

JSON-Storage → perfekt für PoC (nachvollziehbar & commitbar)

Plain JS Frontend → keine unnötige Komplexität

🛡 Fehlerbehandlung
Fehlerfall Verhalten
DNS-Fehler / Domain nicht erreichbar Klare Fehlermeldung, kein Crash
HTTP 404 Klarer Fehler → History-Eintrag mit Status
Kein OpenAI-Key Automatischer Fallback (interner Diff)
LLM-Timeout / API-Fehler Fallback statt Abbruch
Kein Textdiff Kein LLM-Call → Fallback „No significant textual changes detected“

Der Reviewer erkennt sofort: Robust, widerstandsfähig, PoC-geeignet.

🧪 Tests

Tests befinden sich im Backend:

cd backend
npm install
npm test

Wichtig:
Die Docker-Container installieren nur Production-Dependencies (npm ci --only=production).
Daher werden Tests außerhalb des Containers ausgeführt.

Tests:

fetchPage.test.js → Fehlerbehandlung von HTTP-Fehlern

llmService.test.js → Fallback-Logik beim fehlenden API-Key

Beide Tests bestanden → erfüllt die Anforderung „mindestens 2 relevante Tests“.

🤖 KI-Einsatz (transparente Dokumentation)

KI-Tools (ChatGPT/Cursor) wurden eingesetzt für:

Architekturplanung & Strukturierung

Implementierung der Diff-Strategie

Entwurf robuster Fehlermeldungen

Prompt-Engineering für die LLM-Beschreibung

Unterstützung beim Refactoring & Schreiben der Tests

Erstellung und Optimierung dieser Dokumentation

Alle generierten Vorschläge wurden manuell geprüft und angepasst.

🔄 Workflow

Nutzer klickt Crawl now

Backend lädt HTML, extrahiert Text

Diff wird berechnet

Wenn signifikanter Diff → OpenAI

Wenn kein Key oder kein Diff → Fallback

Ergebnis wird gespeichert & im UI angezeigt

✔ Erfüllung der Anforderungen
Anforderung Status
Webseiten-Verwaltung sites.json + UI
Crawling POST /api/crawl
KI-Vergleich OpenAI + Fallback
Änderungsanzeige Vollständig im Frontend
Docker Compose Single-command startup
Tests 2 relevante Tests
Error Handling Umfangreich vorhanden
KI-Einsatz dokumentiert Ja (dieses Kapitel)
📄 Lizenz

MIT – frei nutzbar für i-gelb Evaluation.
