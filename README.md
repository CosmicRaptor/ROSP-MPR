# Citemap — AI-Powered Research Paper Summarization and Citation Graphs

Citemap helps students and researchers **discover papers, screen them with criteria they control, understand them
through summaries and key findings, and explore how they cite each other**.

This is the V1 demo: a working vertical slice.

```
Search → Results → Apply screening → Included/Excluded + reason → Open paper → Summary → Citation graph
```

## Architecture

```
React (Vite + Tailwind)  ──/api──▶  FastAPI
                                      ├─ services/openalex.py    search + metadata (falls back to demo_data.py)
                                      ├─ services/screening.py   rule-based Included/Excluded + reason
                                      ├─ services/summarizer.py  local LLM (Ollama) OR demo summarizer
                                      └─ services/graph.py       nodes + citation edges for Cytoscape.js
```

The backend is **stateless** in V1 (the frontend sends the papers it holds), so there is no database yet.

## Folder structure

```
.
├── README.md
├── .env.example              ← copy to backend/.env
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py           API routes
│       ├── models.py         request/response shapes
│       ├── data/demo_papers.json   offline demo dataset (10 papers with citation links)
│       └── services/         openalex, demo_data, screening, summarizer, graph
└── frontend/
    ├── package.json, vite.config.js, index.html
    └── src/
        ├── main.jsx, App.jsx, AppContext.jsx   shell, routes, shared state
        ├── api/client.js                       every backend call
        ├── pages/        Landing, Results, PaperDetail, GraphPage
        └── components/   ScreeningPanel, PaperCard, SummaryPanel, CitationGraph, StatusBadge, Notice
```

## Run it

You need Python 3.10+ and Node 18+. Use two terminals.

**LLM (one-time)** — install [Ollama](https://ollama.com), then:

```bash
ollama pull qwen3:8b   # ~5 GB; Ollama must be running (open the app or `ollama serve`)
```

Without Ollama the app still works using the demo summarizer.

**Backend** (http://localhost:8000, API docs at `/docs`)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env        # optional
uvicorn app.main:app --reload --port 8000
```

**Frontend** (http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

## Environment variables

All are optional; see `.env.example`.

| Variable | Purpose |
|---|---|
| `OLLAMA_MODEL` | Model for summaries (default `qwen3:8b`). |
| `OLLAMA_HOST` | Ollama server URL (default `http://localhost:11434`). |
| `SUMMARIZER` | `auto` (default), `mock`, or `ollama`. |
| `OPENALEX_EMAIL` | Identifies you to OpenAlex for faster responses. |
| `OPENALEX_API_KEY` | Only if you have an OpenAlex key. |
| `USE_DEMO_DATA` | `true` forces the offline demo dataset (no internet needed). |
| `FRONTEND_ORIGIN` | CORS origins, comma-separated (only matters if you don't use the Vite proxy). |

Frontend: `VITE_BACKEND_URL` (in `frontend/.env`) if the backend is not on `localhost:8000`.

## What is real vs. mocked

| Part | Status |
|---|---|
| Paper search, metadata, abstracts, citation counts, references | **Real** — OpenAlex API |
| Offline fallback dataset | **Demo** — 10 real, well-known papers, but abstracts are short paraphrases and citation counts are rounded. Shown with a visible banner and tagged `source: "demo"`. |
| Screening | **Real** — deterministic rules, no AI |
| Summary (Ollama running) | **Real local LLM** (`qwen3:8b`) — JSON-schema-constrained output (summary, findings, methodology) from the abstract only |
| Summary (Ollama not running / error) | **Demo** — *extractive*: re-selects sentences from the abstract by keyword rules. Labelled "DEMO summarizer (not an LLM)" in the UI. |
| Citation graph | **Real** — edges come from OpenAlex `referenced_works`, limited to links between papers in the list (plus a few widely cited outside works) |

## Known limitations

- Summaries use the **abstract only**, not the full text (no PDF upload/GROBID yet).
- The graph shows only citation links among the listed papers, so a small result set can give a sparse graph. Edges are "A cites B" only; there is no "cited by" expansion.
- Keyword screening is a plain case-insensitive substring match on title + abstract (no stemming/synonyms, one keyword each).
- OpenAlex search is relevance-ranked and returns up to 25 papers; no pagination yet.
- No database, accounts or saved sessions. State lives in the browser tab (`sessionStorage`); summaries are cached in backend memory and reset on restart.
- Local LLM summaries take ~10–15 s per paper on an M4 MacBook Air (first call also loads the model). Small models can still paraphrase loosely; always check against the abstract.
- No automated tests yet.

## Next step

Add **SQLite persistence** (saved searches, screening criteria, cached summaries) plus a **"cited by" expansion** in the
graph service. That makes projects reusable and the graph denser, and it is the foundation for multi-paper literature
synthesis, export and evaluation.
