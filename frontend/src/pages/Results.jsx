import { useState } from "react";
import { Link } from "react-router-dom";
import { screenPapers } from "../api/client.js";
import { useApp } from "../AppContext.jsx";
import Notice from "../components/Notice.jsx";
import PaperCard from "../components/PaperCard.jsx";
import ScreeningPanel from "../components/ScreeningPanel.jsx";

export default function Results() {
  const { query, papers, source, notice, screening, criteria, update } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all | included | excluded

  if (!papers.length) {
    return (
      <p className="text-slate-600">
        No results yet. <Link to="/" className="text-indigo-700 underline">Start a search</Link>.
      </p>
    );
  }

  const screened = Object.keys(screening).length > 0;
  const includedCount = Object.values(screening).filter((s) => s.status === "included").length;

  const apply = async (crit) => {
    setBusy(true);
    setError(null);
    try {
      const results = await screenPapers(papers, crit);
      update({ criteria: crit, screening: Object.fromEntries(results.map((r) => [r.paper_id, r])) });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const visible = papers.filter((p) => filter === "all" || !screened || screening[p.id]?.status === filter);

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="lg:sticky lg:top-4 self-start">
        <ScreeningPanel
          initial={criteria}
          busy={busy}
          onApply={apply}
          onClear={() => update({ screening: {}, criteria: null })}
        />
      </aside>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="font-semibold">
            {papers.length} papers for “{query}”
            {screened && <span className="font-normal text-slate-600"> · {includedCount} included, {papers.length - includedCount} excluded</span>}
          </h1>
          <div className="flex items-center gap-2">
            {screened && (
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-slate-300 rounded px-2 py-1 text-sm bg-white">
                <option value="all">Show all</option>
                <option value="included">Included only</option>
                <option value="excluded">Excluded only</option>
              </select>
            )}
            <Link to="/graph" className="bg-indigo-700 hover:bg-indigo-800 text-white rounded px-3 py-1.5 text-sm">
              View citation graph
            </Link>
          </div>
        </div>

        {source === "demo" && <Notice>{notice || "Showing the offline demo dataset."}</Notice>}
        <Notice tone="red">{error}</Notice>

        {visible.map((p) => (
          <PaperCard key={p.id} paper={p} screening={screening[p.id]} />
        ))}
      </section>
    </div>
  );
}
