import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";

// Colours: included = green, excluded = red, not screened = indigo, external (cited but not in list) = grey.
const COLORS = { included: "#059669", excluded: "#e11d48", unscreened: "#4f46e5", external: "#94a3b8" };

const shorten = (s, n = 34) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export default function CitationGraph({ graph, statusById, onSelect }) {
  const box = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    const elements = [
      ...graph.nodes.map((n) => ({
        data: {
          id: n.id,
          label: `${shorten(n.label)}${n.year ? ` (${n.year})` : ""}`,
          // node size grows with log(citations) so a few huge papers don't dominate
          size: 18 + Math.min(30, Math.log10(n.citation_count + 1) * 7),
          color: n.external ? COLORS.external : COLORS[statusById[n.id] || "unscreened"],
        },
      })),
      ...graph.edges.map((e, i) => ({ data: { id: `e${i}`, source: e.source, target: e.target } })),
    ];

    const cy = cytoscape({
      container: box.current,
      elements,
      minZoom: 0.2,
      maxZoom: 3,
      wheelSensitivity: 0.3, // zoom: mouse wheel / pinch; pan: drag the background
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)", "background-color": "data(color)", width: "data(size)", height: "data(size)",
            "font-size": 9, color: "#1e293b", "text-wrap": "wrap", "text-max-width": 110,
            "text-valign": "bottom", "text-margin-y": 3,
          },
        },
        {
          selector: "edge",
          style: { width: 1, "line-color": "#cbd5e1", "target-arrow-color": "#94a3b8", "target-arrow-shape": "triangle", "curve-style": "bezier", "arrow-scale": 0.8 },
        },
        { selector: "node:selected", style: { "border-width": 3, "border-color": "#f59e0b" } },
      ],
      // "cose" is a built-in force-directed layout: connected papers cluster together.
      layout: { name: "cose", animate: false, nodeRepulsion: () => 9000, idealEdgeLength: () => 90, padding: 20 },
    });

    cy.on("tap", "node", (evt) => onSelect(evt.target.id()));
    cy.on("tap", (evt) => evt.target === cy && onSelect(null)); // click background = deselect
    cyRef.current = cy;
    return () => cy.destroy();
  }, [graph, statusById]);

  const zoom = (f) => {
    const cy = cyRef.current;
    if (cy) cy.zoom({ level: cy.zoom() * f, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
  };

  return (
    <div className="relative">
      <div ref={box} className="h-[520px] w-full bg-white border border-slate-200 rounded" />
      <div className="absolute top-2 right-2 flex gap-1">
        <button onClick={() => zoom(1.25)} className="bg-white border border-slate-300 rounded w-8 h-8" aria-label="Zoom in">+</button>
        <button onClick={() => zoom(0.8)} className="bg-white border border-slate-300 rounded w-8 h-8" aria-label="Zoom out">−</button>
        <button onClick={() => cyRef.current?.fit(undefined, 20)} className="bg-white border border-slate-300 rounded px-2 h-8 text-xs">Fit</button>
      </div>
    </div>
  );
}
