"""Citemap API entry point.  Run:  uvicorn app.main:app --reload --port 8000

Flow:  /api/search -> /api/screen -> /api/summarize and /api/graph
The API is stateless: the frontend sends the papers it already holds, so the
backend needs no database in V1.
"""
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()  # read backend/.env (or the project-root .env) before importing services

from .models import (  # noqa: E402
    GraphRequest, GraphResponse, ScreenRequest, ScreeningResult,
    SearchRequest, SearchResponse, SummarizeRequest, Summary,
)
from .services import demo_data, openalex  # noqa: E402
from .services.graph import build_graph  # noqa: E402
from .services.screening import screen_papers  # noqa: E402
from .services.summarizer import get_summarizer, summarize_paper  # noqa: E402

app = FastAPI(title="Citemap API", version="0.1.0")

origins = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"])


@app.get("/api/health")
def health():
    s = get_summarizer()
    return {
        "status": "ok",
        "summarizer": type(s).__name__,
        "demo_data_forced": os.getenv("USE_DEMO_DATA", "").lower() == "true",
    }


@app.post("/api/search", response_model=SearchResponse)
def search(req: SearchRequest):
    if os.getenv("USE_DEMO_DATA", "").lower() != "true":
        try:
            papers = openalex.search_works(req.query, req.limit)
            if papers:
                return SearchResponse(papers=papers, source="openalex")
            notice = "OpenAlex returned no results for this query; showing the demo dataset instead."
        except openalex.OpenAlexError:
            notice = "OpenAlex is unavailable right now; showing the offline demo dataset instead."
    else:
        notice = "USE_DEMO_DATA is enabled; showing the offline demo dataset."

    papers, matched = demo_data.search_demo(req.query, req.limit)
    if not matched:
        notice += " (No demo paper matched your query, so all demo papers are listed.)"
    return SearchResponse(papers=papers, source="demo", notice=notice)


@app.post("/api/screen", response_model=list[ScreeningResult])
def screen(req: ScreenRequest):
    return screen_papers(req.papers, req.criteria)


@app.post("/api/summarize", response_model=Summary)
def summarize(req: SummarizeRequest):
    return summarize_paper(req.paper)


@app.post("/api/graph", response_model=GraphResponse)
def graph(req: GraphRequest):
    return build_graph(req.papers)
