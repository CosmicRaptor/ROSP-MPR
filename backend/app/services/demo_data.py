"""Small offline dataset used when OpenAlex is unreachable (or USE_DEMO_DATA=true).

The papers are real, well-known works, but the abstracts in demo_papers.json are
short paraphrases and the citation counts are rounded approximations.
Everything returned from here is tagged source="demo" so the UI can label it.
"""
import json
import re
from pathlib import Path

from ..models import Paper

_DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "demo_papers.json"


def load_demo_papers() -> list[Paper]:
    with _DATA_FILE.open(encoding="utf-8") as f:
        return [Paper(**{**p, "source": "demo"}) for p in json.load(f)]


def search_demo(query: str, limit: int) -> tuple[list[Paper], bool]:
    """Keyword-overlap search. Returns (papers, matched).

    If nothing matches we return the whole demo set (matched=False) so the
    demo never shows an empty screen.
    """
    papers = load_demo_papers()
    tokens = [t for t in re.findall(r"\w+", query.lower()) if len(t) > 2]

    def score(p: Paper) -> int:
        text = f"{p.title} {p.abstract or ''}".lower()
        return sum(t in text for t in tokens)

    scored = sorted(((score(p), p) for p in papers), key=lambda x: -x[0])
    hits = [p for s, p in scored if s > 0]
    if hits:
        return hits[:limit], True
    return papers[:limit], False
