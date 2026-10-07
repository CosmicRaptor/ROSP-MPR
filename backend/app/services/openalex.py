"""OpenAlex client (https://docs.openalex.org). Free, no key required.

Setting OPENALEX_EMAIL is recommended: OpenAlex puts requests that identify
themselves in a faster "polite pool".
"""
import os
from typing import Optional

import httpx

from ..models import Paper

BASE_URL = "https://api.openalex.org"
# Only ask for the fields we use: much smaller responses.
SELECT = (
    "id,display_name,publication_year,cited_by_count,authorships,"
    "primary_location,doi,abstract_inverted_index,referenced_works"
)


class OpenAlexError(Exception):
    """Raised for any network/API problem so callers can fall back to demo data."""


def _short_id(openalex_url: str) -> str:
    """'https://openalex.org/W123' -> 'W123'"""
    return openalex_url.rsplit("/", 1)[-1]


def reconstruct_abstract(inverted: Optional[dict]) -> Optional[str]:
    """OpenAlex ships abstracts as {word: [positions]}; rebuild the plain text."""
    if not inverted:
        return None
    slots: dict[int, str] = {}
    for word, positions in inverted.items():
        for pos in positions:
            slots[pos] = word
    return " ".join(slots[i] for i in sorted(slots)) or None


def _to_paper(work: dict) -> Paper:
    loc = work.get("primary_location") or {}
    source = loc.get("source") or {}
    authors = [
        a["author"]["display_name"]
        for a in work.get("authorships", [])
        if a.get("author", {}).get("display_name")
    ]
    return Paper(
        id=_short_id(work["id"]),
        title=work.get("display_name") or "(untitled)",
        authors=authors,
        year=work.get("publication_year"),
        citation_count=work.get("cited_by_count") or 0,
        venue=source.get("display_name"),
        abstract=reconstruct_abstract(work.get("abstract_inverted_index")),
        url=work.get("doi") or loc.get("landing_page_url") or work["id"],
        references=[_short_id(r) for r in work.get("referenced_works", [])],
        source="openalex",
    )


def _get(path: str, params: dict) -> dict:
    params = {**params}
    if os.getenv("OPENALEX_EMAIL"):
        params["mailto"] = os.environ["OPENALEX_EMAIL"]
    if os.getenv("OPENALEX_API_KEY"):
        params["api_key"] = os.environ["OPENALEX_API_KEY"]
    try:
        r = httpx.get(f"{BASE_URL}{path}", params=params, timeout=15.0)
        r.raise_for_status()
        return r.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise OpenAlexError(str(exc)) from exc


def search_works(query: str, limit: int = 25) -> list[Paper]:
    # has_abstract:true -> summaries need an abstract, and some publishers (e.g. Nature) don't share them with OpenAlex.
    data = _get("/works", {"search": query, "per-page": limit, "select": SELECT, "filter": "has_abstract:true"})
    return [_to_paper(w) for w in data.get("results", [])]


def fetch_work_summaries(ids: list[str]) -> dict[str, dict]:
    """Title/year/citations for a batch of work ids (used for graph 'external' nodes)."""
    if not ids:
        return {}
    data = _get(
        "/works",
        {"filter": "openalex:" + "|".join(ids), "per-page": len(ids), "select": "id,display_name,publication_year,cited_by_count"},
    )
    return {_short_id(w["id"]): w for w in data.get("results", [])}
