import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchPapers } from "../api/client.js";
import { useApp } from "../AppContext.jsx";
import Notice from "../components/Notice.jsx";

export default function Landing() {
  const { query: last, setSearchResults } = useApp();
  const [query, setQuery] = useState(last || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await searchPapers(query.trim());
      setSearchResults({ query: query.trim(), papers: res.papers, source: res.source, notice: res.notice });
      navigate("/results");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center py-10 space-y-6">
      <h1 className="text-4xl font-semibold text-indigo-800 tracking-tight">Citemap</h1>
      <p className="text-slate-600">
        AI-powered research paper summarization and citation graphs. Find papers on a topic, screen them with
        criteria you control, read concise summaries, and explore how the papers cite each other.
      </p>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a research topic, e.g. transformer language models"
          className="flex-1 border border-slate-300 rounded px-3 py-2 bg-white"
          autoFocus
        />
        <button disabled={busy} className="bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white rounded px-4 py-2">
          {busy ? "Searching…" : "Search Papers"}
        </button>
      </form>
      <Notice tone="red">{error}</Notice>
      <ol className="text-sm text-slate-500 text-left inline-block list-decimal pl-5 space-y-0.5">
        <li>Search a topic</li>
        <li>Screen the results with your own criteria</li>
        <li>Open a paper for its summary and key findings</li>
        <li>Explore the citation graph</li>
      </ol>
    </div>
  );
}
