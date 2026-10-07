import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchGraph } from "../api/client.js";
import { useApp } from "../AppContext.jsx";
import CitationGraph from "../components/CitationGraph.jsx";
import Notice from "../components/Notice.jsx";

export default function GraphPage() {
  const { papers, screening } = useApp();
  const navigate = useNavigate();
  const screened = Object.keys(screening).length > 0;
  const [onlyIncluded, setOnlyIncluded] = useState(true);
  const [graph, setGraph] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  // Graph is built from the "selected" papers: the included ones if screening was applied.
  const shown = useMemo(
    () => papers.filter((p) => !(screened && onlyIncluded) || screening[p.id]?.status === "included"),
    [papers, screening, screened, onlyIncluded]
  );
  const statusById = useMemo(
    () => Object.fromEntries(Object.entries(screening).map(([id, r]) => [id, r.status])),
    [screening]
  );

  useEffect(() => {
    if (!shown.length) return setGraph(null);
    let cancelled = false;
    setGraph(null);
    setError(null);
    setSelected(null);
    fetchGraph(shown)
      .then((g) => !cancelled && setGraph(g))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [shown]);

  if (!papers.length) {
    return <p className="text-slate-600">No papers yet. <Link to="/" className="text-indigo-700 underline">Start a search</Link>.</p>;
  }

  const node = graph?.nodes.find((n) => n.id === selected);
  const inList = node && !node.external;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="font-semibold">Citation graph</h1>
        {screened && (
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={onlyIncluded} onChange={(e) => setOnlyIncluded(e.target.checked)} />
            Only included papers
          </label>
        )}
      </div>
      <p className="text-xs text-slate-500">
        Arrow A → B means “A cites B”. Scroll/pinch to zoom, drag to pan, click a node for details. Node size reflects citation count.
        Grey nodes are works cited by several listed papers but not in the list.
      </p>
      <div className="flex gap-3 text-xs flex-wrap">
        {[["#4f46e5", "Not screened"], ["#059669", "Included"], ["#e11d48", "Excluded"], ["#94a3b8", "Outside list"]].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1"><i className="inline-block w-3 h-3 rounded-full" style={{ background: c }} />{l}</span>
        ))}
      </div>

      <Notice tone="red">{error}</Notice>
      {!shown.length && <Notice>No papers to show. Loosen the screening criteria or untick “Only included papers”.</Notice>}
      {graph?.notice && <Notice>{graph.notice}</Notice>}
      {shown.length > 0 && !graph && !error && <p className="text-sm text-slate-500">Building graph…</p>}

      {graph && (
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <CitationGraph graph={graph} statusById={statusById} onSelect={setSelected} />
          <aside className="bg-white border border-slate-200 rounded p-3 text-sm self-start">
            {node ? (
              <div className="space-y-1">
                <h2 className="font-medium">{node.label}</h2>
                <p className="text-slate-500">{node.year ?? "Year n/a"} · {node.citation_count.toLocaleString()} citations</p>
                {node.external && <p className="text-slate-500">Not in your result list.</p>}
                {inList && (
                  <button onClick={() => navigate(`/paper/${node.id}`)} className="mt-1 bg-indigo-700 text-white rounded px-3 py-1.5">
                    Open paper & summary
                  </button>
                )}
              </div>
            ) : (
              <p className="text-slate-500">Click a node to see its details.</p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
