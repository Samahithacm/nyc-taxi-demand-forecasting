import { TrendingDown, TrendingUp } from "lucide-react";

/**
 * Metric card with optional directional trend indicator.
 *
 * @param {object} props
 * @param {string} props.title Metric label.
 * @param {string|number} props.value Primary value.
 * @param {string} [props.subtitle] Supporting text.
 * @param {string} [props.accent] Tailwind text color class for value.
 * @param {"up"|"down"|null} [props.trend] Trend direction.
 * @param {string} [props.trendValue] Trend label, such as "+5.2%".
 */
export default function MetricCard({
  title,
  value,
  subtitle,
  accent = "text-white",
  trend = null,
  trendValue,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm text-slate-400">{title}</div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs ${
              trend === "up" ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {trend === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trendValue}
          </div>
        )}
      </div>
      <div className={`mt-2 text-3xl font-semibold ${accent}`}>{value}</div>
      {subtitle && <div className="mt-2 text-sm text-slate-400">{subtitle}</div>}
    </div>
  );
}
