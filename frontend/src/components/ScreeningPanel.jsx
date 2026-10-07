import { useState } from "react";

// Numeric inputs are sent as numbers (or null when blank = "don't check this rule").
const num = (v) => (v === "" ? null : Number(v));

export default function ScreeningPanel({ initial, onApply, onClear, busy }) {
  const [f, setF] = useState({
    min_year: initial?.min_year ?? "",
    max_year: initial?.max_year ?? "",
    min_citations: initial?.min_citations ?? "",
    required_keyword: initial?.required_keyword ?? "",
    excluded_keyword: initial?.excluded_keyword ?? "",
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    onApply({
      min_year: num(f.min_year),
      max_year: num(f.max_year),
      min_citations: num(f.min_citations),
      required_keyword: f.required_keyword.trim() || null,
      excluded_keyword: f.excluded_keyword.trim() || null,
    });
  };

  const input = "w-full border border-slate-300 rounded px-2 py-1.5 text-sm bg-white";
  const label = "block text-xs font-medium text-slate-600 mb-1";

  return (
    <form onSubmit={submit} className="bg-white border border-slate-200 rounded p-4 space-y-3">
      <h2 className="font-semibold">Screening criteria</h2>
      <p className="text-xs text-slate-500">Leave a field empty to skip that rule.</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={label}>Min year</label>
          <input type="number" className={input} value={f.min_year} onChange={set("min_year")} placeholder="2020" />
        </div>
        <div>
          <label className={label}>Max year</label>
          <input type="number" className={input} value={f.max_year} onChange={set("max_year")} placeholder="2026" />
        </div>
      </div>
      <div>
        <label className={label}>Min citation count</label>
        <input type="number" min="0" className={input} value={f.min_citations} onChange={set("min_citations")} placeholder="10" />
      </div>
      <div>
        <label className={label}>Required keyword (title or abstract)</label>
        <input className={input} value={f.required_keyword} onChange={set("required_keyword")} placeholder="e.g. language" />
      </div>
      <div>
        <label className={label}>Excluded keyword (optional)</label>
        <input className={input} value={f.excluded_keyword} onChange={set("excluded_keyword")} placeholder="e.g. survey" />
      </div>
      <div className="flex gap-2">
        <button disabled={busy} className="flex-1 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white rounded px-3 py-2 text-sm">
          {busy ? "Applying…" : "Apply screening"}
        </button>
        <button type="button" onClick={onClear} className="border border-slate-300 rounded px-3 py-2 text-sm hover:bg-slate-50">
          Clear
        </button>
      </div>
    </form>
  );
}
