import { useEffect, useState } from "react";
import { summarizePaper } from "../api/client.js";
import Notice from "./Notice.jsx";

// Loads the summary from the backend. The provider badge makes it obvious whether a real LLM
// or the offline demo summarizer produced the text.
export default function SummaryPanel({ paper }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    summarizePaper(paper)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [paper.id]);

  if (error) return <Notice tone="red">{error}</Notice>;
  if (!data) return <p className="text-sm text-slate-500">Generating summary…</p>;

  return (
    <section className="bg-white border border-slate-200 rounded p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="font-semibold">Summary</h2>
        {data.provider !== "none" && <span className={`text-xs px-2 py-0.5 rounded ${data.is_mock ? "bg-amber-100 text-amber-900" : "bg-indigo-100 text-indigo-800"}`}>
          {data.is_mock ? "DEMO summarizer (not an LLM)" : `AI summary · ${data.model}`}
        </span>}
      </div>
      <Notice>{data.notice}</Notice>
      <p className="text-sm">{data.summary}</p>

      <div>
        <h3 className="text-sm font-medium">Key findings</h3>
        {data.key_findings.length ? (
          <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
            {data.key_findings.map((k, i) => <li key={i}>{k}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">None extracted.</p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium">Methodology</h3>
        <p className="text-sm text-slate-700">{data.methodology || "Not stated in the abstract."}</p>
      </div>
    </section>
  );
}
