export default function Notice({ children, tone = "amber" }) {
  if (!children) return null;
  const cls = tone === "red" ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-amber-50 border-amber-200 text-amber-900";
  return <div className={`border rounded px-3 py-2 text-sm ${cls}`}>{children}</div>;
}
