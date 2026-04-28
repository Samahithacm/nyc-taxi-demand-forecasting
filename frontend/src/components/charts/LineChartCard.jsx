import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Reusable line chart card for time series and comparison charts.
 *
 * @param {object} props
 * @param {string} [props.title] Card title.
 * @param {string} [props.subtitle] Card subtitle.
 * @param {Array<object>} props.data Recharts data array.
 * @param {Array<{dataKey: string, name: string, color: string}>} props.lines Line definitions.
 * @param {string} [props.xAxisKey] X-axis data key.
 * @param {number} [props.height] Chart height in pixels.
 * @param {boolean} [props.showLegend] Whether to render the chart legend.
 * @param {React.ReactNode} [props.children] Optional extra Recharts elements, such as ReferenceLine.
 */
export default function LineChartCard({
  title,
  subtitle,
  data,
  lines,
  xAxisKey = "name",
  height = 300,
  showLegend = true,
  children,
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
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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
          {lines.map((line, idx) => (
            <Line
              key={line.dataKey || idx}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
          {children}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
