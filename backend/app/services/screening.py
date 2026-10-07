"""Screening engine: rule-based, transparent, no AI involved.

Every paper gets Included/Excluded plus a human-readable reason, so users can
always see *why* a paper was filtered out.
"""
from typing import Optional

from ..models import Paper, ScreeningCriteria, ScreeningResult


def _clean(text: Optional[str]) -> Optional[str]:
    text = (text or "").strip()
    return text or None


def _year_range_text(lo: Optional[int], hi: Optional[int]) -> str:
    if lo is not None and hi is not None:
        return f"{lo}–{hi}"
    if lo is not None:
        return f"{lo} onwards"
    return f"up to {hi}"


def screen_paper(paper: Paper, c: ScreeningCriteria) -> ScreeningResult:
    reasons: list[str] = []

    # 1. Publication year range
    if c.min_year is not None or c.max_year is not None:
        rng = _year_range_text(c.min_year, c.max_year)
        if paper.year is None:
            reasons.append(f"publication year is unknown so it cannot be checked against selected range {rng}")
        elif (c.min_year is not None and paper.year < c.min_year) or (
            c.max_year is not None and paper.year > c.max_year
        ):
            reasons.append(f"publication year {paper.year} is outside selected range {rng}")

    # 2. Minimum citations
    if c.min_citations is not None and paper.citation_count < c.min_citations:
        reasons.append(f"citation count {paper.citation_count} is below the minimum of {c.min_citations}")

    # 3. Keywords are matched case-insensitively against title + abstract
    haystack = f"{paper.title} {paper.abstract or ''}".lower()

    required = _clean(c.required_keyword)
    if required and required.lower() not in haystack:
        note = "" if paper.abstract else " (no abstract available to search)"
        reasons.append(f'required keyword "{required}" was not found in the title or abstract{note}')

    excluded = _clean(c.excluded_keyword)
    if excluded and excluded.lower() in haystack:
        reasons.append(f'title or abstract contains the excluded keyword "{excluded}"')

    if reasons:
        return ScreeningResult(paper_id=paper.id, status="excluded", reason="Excluded — " + "; ".join(reasons) + ".")

    any_rule = any(
        [c.min_year is not None, c.max_year is not None, c.min_citations is not None, required, excluded]
    )
    msg = "Included — meets all selected criteria." if any_rule else "Included — no screening criteria applied."
    return ScreeningResult(paper_id=paper.id, status="included", reason=msg)


def screen_papers(papers: list[Paper], criteria: ScreeningCriteria) -> list[ScreeningResult]:
    return [screen_paper(p, criteria) for p in papers]
