const LEGENDS = {
  demand: {
    title: "Total Demand",
    items: [
      { color: "#67e8f9", label: "Lower" },
      { color: "#06b6d4", label: "Medium" },
      { color: "#0891b2", label: "Higher" },
    ],
  },
  accuracy: {
    title: "Forecast Accuracy (sMAPE)",
    items: [
      { color: "#10b981", label: "Best (low error)" },
      { color: "#f59e0b", label: "Medium" },
      { color: "#ef4444", label: "Worst (high error)" },
    ],
  },
  improvement: {
    title: "Adaptive vs Static",
    items: [
      { color: "#67e8f9", label: "Smaller gain" },
      { color: "#06b6d4", label: "Medium gain" },
      { color: "#0891b2", label: "Bigger gain" },
    ],
  },
};

/**
 * Color legend for the selected geographic metric.
 *
 * @param {object} props
 * @param {"demand"|"accuracy"|"improvement"} props.metric Active map metric.
 */
export default function MapLegend({ metric }) {
  const current = LEGENDS[metric] || LEGENDS.demand;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 text-sm font-medium text-white">{current.title}</div>
      <div className="space-y-2">
        {current.items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 border-t border-white/10 pt-3 text-xs text-slate-500">
        Circle size represents total demand volume
      </div>
    </div>
  );
}
