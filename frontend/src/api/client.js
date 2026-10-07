// All backend calls live here, so components never build URLs or parse errors themselves.
async function post(path, body) {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Request to ${path} failed (${res.status}). Is the backend running on port 8000?`);
  }
  return res.json();
}

export const searchPapers = (query, limit = 25) => post("/search", { query, limit });
export const screenPapers = (papers, criteria) => post("/screen", { papers, criteria });
export const summarizePaper = (paper) => post("/summarize", { paper });
export const fetchGraph = (papers) => post("/graph", { papers });
