import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge.jsx";

export default function PaperCard({ paper, screening }) {
  const authors = paper.authors.slice(0, 4).join(", ") + (paper.authors.length > 4 ? " et al." : "");
  const excerpt = paper.abstract ? paper.abstract.slice(0, 260) + (paper.abstract.length > 260 ? "…" : "") : null;
  return (
    <article className="bg-white border border-slate-200 rounded p-4">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/paper/${paper.id}`} className="font-medium text-indigo-800 hover:underline">
          {paper.title}
        </Link>
        <StatusBadge status={screening?.status} />
      </div>
      <p className="text-sm text-slate-600 mt-1">{authors || "Unknown authors"}</p>
      <p className="text-xs text-slate-500 mt-1">
        {paper.year ?? "Year n/a"} · {paper.citation_count.toLocaleString()} citations
        {paper.venue ? ` · ${paper.venue}` : ""}
      </p>
      {excerpt ? (
        <p className="text-sm mt-2 text-slate-700">{excerpt}</p>
      ) : (
        <p className="text-sm mt-2 text-slate-400 italic">No abstract available.</p>
      )}
      {screening && (
        <p className={`text-sm mt-2 ${screening.status === "excluded" ? "text-rose-700" : "text-emerald-700"}`}>
          {screening.reason}
        </p>
      )}
    </article>
  );
}
