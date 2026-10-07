"""Citation graph service.

Nodes = the given papers. Edge A -> B means "A cites B" (taken from OpenAlex's
`referenced_works`). We only draw edges where BOTH ends are in the list.

To make sparse graphs more useful we also add a few "external" nodes: works
that are not in the list but are cited by at least two papers that are.
"""
from collections import Counter

from ..models import GraphEdge, GraphNode, GraphResponse, Paper
from . import openalex

MAX_EXTERNAL = 10


def build_graph(papers: list[Paper]) -> GraphResponse:
    ids = {p.id for p in papers}
    nodes = [
        GraphNode(id=p.id, label=p.title, year=p.year, citation_count=p.citation_count) for p in papers
    ]
    edges = [
        GraphEdge(source=p.id, target=ref) for p in papers for ref in p.references if ref in ids and ref != p.id
    ]

    notice = None
    # External nodes only make sense for real OpenAlex ids (we can look their titles up).
    if papers and all(p.source == "openalex" for p in papers):
        counts = Counter(ref for p in papers for ref in set(p.references) if ref not in ids)
        shared = [ref for ref, n in counts.most_common(MAX_EXTERNAL) if n >= 2]
        if shared:
            try:
                info = openalex.fetch_work_summaries(shared)
                for ref in shared:
                    w = info.get(ref)
                    if not w:
                        continue
                    nodes.append(
                        GraphNode(
                            id=ref,
                            label=w.get("display_name") or ref,
                            year=w.get("publication_year"),
                            citation_count=w.get("cited_by_count") or 0,
                            external=True,
                        )
                    )
                    edges += [GraphEdge(source=p.id, target=ref) for p in papers if ref in p.references]
            except openalex.OpenAlexError:
                notice = "Could not load extra referenced works from OpenAlex; showing only the listed papers."

    if not edges:
        notice = (notice or "") + " No citation links found between these papers."
    return GraphResponse(nodes=nodes, edges=edges, notice=notice.strip() if notice else None)
