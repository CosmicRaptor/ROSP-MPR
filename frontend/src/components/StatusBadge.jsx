const STYLES = {
  included: "bg-emerald-100 text-emerald-800",
  excluded: "bg-rose-100 text-rose-800",
  unscreened: "bg-slate-100 text-slate-600",
};
const LABELS = { included: "Included", excluded: "Excluded", unscreened: "Not screened" };

export default function StatusBadge({ status = "unscreened" }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
