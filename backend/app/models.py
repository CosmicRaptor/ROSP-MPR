"""Shared data shapes (request/response bodies) for the Citemap API.

Keeping them in one file makes it easy to see what the frontend can expect.
"""
from typing import Literal, Optional

from pydantic import BaseModel, Field


class Paper(BaseModel):
    id: str                                   # short OpenAlex id (e.g. "W2741809807") or "demo-..." id
    title: str
    authors: list[str] = Field(default_factory=list)
    year: Optional[int] = None
    citation_count: int = 0
    venue: Optional[str] = None
    abstract: Optional[str] = None
    url: Optional[str] = None                 # DOI / landing page / OpenAlex page
    references: list[str] = Field(default_factory=list)  # ids of works this paper cites
    source: Literal["openalex", "demo"] = "openalex"


class SearchRequest(BaseModel):
    query: str = Field(min_length=1)
    limit: int = Field(default=25, ge=1, le=100)


class SearchResponse(BaseModel):
    papers: list[Paper]
    source: Literal["openalex", "demo"]
    notice: Optional[str] = None              # shown to the user, e.g. "OpenAlex unavailable, showing demo data"


class ScreeningCriteria(BaseModel):
    """All fields optional: an empty criterion is simply not checked."""
    min_year: Optional[int] = None
    max_year: Optional[int] = None
    min_citations: Optional[int] = None
    required_keyword: Optional[str] = None    # must appear in title or abstract
    excluded_keyword: Optional[str] = None    # must NOT appear in title or abstract


class ScreenRequest(BaseModel):
    papers: list[Paper]
    criteria: ScreeningCriteria


class ScreeningResult(BaseModel):
    paper_id: str
    status: Literal["included", "excluded"]
    reason: str


class SummarizeRequest(BaseModel):
    paper: Paper


class Summary(BaseModel):
    paper_id: str
    summary: str
    key_findings: list[str]
    methodology: Optional[str] = None
    provider: str                             # "ollama" or "mock-extractive"
    model: Optional[str] = None
    is_mock: bool                             # True => NOT produced by an LLM; UI must label it
    notice: Optional[str] = None


class GraphRequest(BaseModel):
    papers: list[Paper]


class GraphNode(BaseModel):
    id: str
    label: str
    year: Optional[int] = None
    citation_count: int = 0
    external: bool = False                    # True => not in the candidate list, only referenced by it


class GraphEdge(BaseModel):
    source: str                               # the citing paper
    target: str                               # the cited paper


class GraphResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]
    notice: Optional[str] = None
