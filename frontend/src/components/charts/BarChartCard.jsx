import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Reusable bar chart card for categorical comparisons.
 *
 * @param {object} props
 * @param {string} [props.title] Card title.
 * @param {string} [props.subtitle] Card subtitle.
 * @param {Array<object>} props.data Recharts data array.
 * @param {Array<{dataKey: string, name: string, color: string, colorKey?: string}>} props.bars Bar definitions.
 * @param {string} [props.xAxisKey] X-axis data key.
 * @param {number} [props.height] Chart height in pixels.
 * @param {boolean} [props.showLegend] Whether to render the chart legend.
 */
export default function BarChartCard({
  title,
  subtitle,
  data,
  bars,
  xAxisKey = "name",
  height = 300,
  showLegend = true,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
      {title && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey={xAxisKey} stroke="#94a3b8" style={{ fontSize: "12px" }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "8px",
            }}
          />
          {showLegend && <Legend />}
          {bars.map((bar, idx) => (
            <Bar
              key={bar.dataKey || idx}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color}
              radius={[6, 6, 0, 0]}
            >
              {bar.colorKey &&
                data.map((entry, cellIndex) => (
                  <Cell key={`${bar.dataKey}-${cellIndex}`} fill={entry[bar.colorKey] || bar.color} />
                ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
