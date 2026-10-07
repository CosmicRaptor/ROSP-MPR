import { Link, useParams } from "react-router-dom";
import { useApp } from "../AppContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import SummaryPanel from "../components/SummaryPanel.jsx";

export default function PaperDetail() {
  const { id } = useParams();
  const { papers, screening } = useApp();
  const paper = papers.find((p) => p.id === id);

  if (!paper) {
    return (
      <p className="text-slate-600">
        Paper not found in the current results. <Link to="/" className="text-indigo-700 underline">Start a new search</Link>.
      </p>
    );
  }
  const s = screening[paper.id];

  return (
    <div className="space-y-4">
      <Link to="/results" className="text-sm text-indigo-700 hover:underline">← Back to results</Link>

      <div className="bg-white border border-slate-200 rounded p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold">{paper.title}</h1>
          <StatusBadge status={s?.status} />
        </div>
        <p className="text-sm text-slate-600">{paper.authors.join(", ") || "Unknown authors"}</p>
        <p className="text-sm text-slate-500">
          {paper.year ?? "Year n/a"} · {paper.citation_count.toLocaleString()} citations
          {paper.venue ? ` · ${paper.venue}` : ""}
          {paper.source === "demo" ? " · demo dataset" : ""}
        </p>
        {s && <p className={`text-sm ${s.status === "excluded" ? "text-rose-700" : "text-emerald-700"}`}>{s.reason}</p>}
        {paper.url && (
          <a href={paper.url} target="_blank" rel="noreferrer" className="text-sm text-indigo-700 hover:underline">
            Open source link ↗
          </a>
        )}
        <h2 className="font-semibold pt-2">Abstract</h2>
        <p className="text-sm text-slate-700">{paper.abstract || "No abstract available."}</p>
      </div>

      <SummaryPanel paper={paper} />

      <Link to="/graph" className="inline-block bg-indigo-700 hover:bg-indigo-800 text-white rounded px-3 py-2 text-sm">
        View citation graph
      </Link>
    </div>
  );
}
