import { useMemo, useState } from "react";
import { BarChart3, MapPin, TrendingUp } from "lucide-react";
import BarChartCard from "../components/charts/BarChartCard";
import MetricCard from "../components/charts/MetricCard";
import MapLegend from "../components/maps/MapLegend";
import NYCZoneMap from "../components/maps/NYCZoneMap";
import LoadingState from "../components/ui/LoadingState";

const METRIC_OPTIONS = [
  { id: "demand", label: "Total Demand", icon: BarChart3 },
  { id: "accuracy", label: "Forecast Accuracy", icon: TrendingUp },
  { id: "improvement", label: "Adaptive Improvement", icon: TrendingUp },
];

function formatMetric(metric, value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "n/a";
  if (metric === "demand") return value.toLocaleString("en-US");
  return `${value.toFixed(2)}%`;
}

/**
 * Geographic zone analysis page with interactive Leaflet map.
 *
 * @param {object} props
 * @param {Array<object>} props.zones Modeled taxi zones with coordinates.
 * @param {object} props.zonePerformance Per-zone model performance payload.
 */
export default function ZoneAnalysisPage({ zones, zonePerformance }) {
  const [metric, setMetric] = useState("demand");
  const [selectedZone, setSelectedZone] = useState(null);

  const performanceByZone = useMemo(() => {
    const entries = zonePerformance?.zones || [];
    return new Map(entries.map((item) => [item.zone_id, item]));
  }, [zonePerformance]);

  const topZones = useMemo(() => {
    if (!zones?.length) return [];

    return [...zones]
      .map((zone) => {
        const perf = performanceByZone.get(zone.id);
        const displayValue =
          metric === "accuracy"
            ? perf?.metrics?.adaptive_smape || 0
            : metric === "improvement"
              ? perf?.metrics?.improvement_pct || 0
              : zone.total_demand || 0;

        return { ...zone, displayValue, perf };
      })
      .sort((a, b) =>
        metric === "accuracy" ? a.displayValue - b.displayValue : b.displayValue - a.displayValue
      )
      .slice(0, 5);
  }, [metric, performanceByZone, zones]);

  const boroughChartData = useMemo(() => {
    if (!zonePerformance?.by_borough) return [];
    return Object.entries(zonePerformance.by_borough).map(([name, data]) => ({
      name,
      static: data.avg_static_smape,
      adaptive: data.avg_adaptive_smape,
    }));
  }, [zonePerformance]);

  if (!zones || !zonePerformance) {
    return <LoadingState message="Loading zone data..." />;
  }

  const selectedPerf = selectedZone ? performanceByZone.get(selectedZone.id) : null;

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8 shadow-2xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
          <MapPin size={14} />
          Zone Analysis
        </div>
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          NYC Taxi Demand Geographic View
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
          Explore demand patterns and forecast accuracy across NYC's top 20 taxi zones. Click
          any zone for detailed metrics.
        </p>
      </header>

      <section className="flex flex-wrap gap-3">
        {METRIC_OPTIONS.map((option) => {
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setMetric(option.id)}
              className={`flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition ${
                metric === option.id
                  ? "bg-cyan-400 text-slate-950"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Icon size={16} />
              {option.label}
            </button>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-2 shadow-xl">
            <NYCZoneMap
              zones={zones}
              zonePerformance={zonePerformance}
              metric={metric}
              onZoneSelect={setSelectedZone}
              selectedZoneId={selectedZone?.id}
            />
          </div>

          {boroughChartData.length > 0 && (
            <BarChartCard
              title="Performance by Borough"
              subtitle="Average sMAPE comparison: static model versus adaptive retraining."
              data={boroughChartData}
              bars={[
                { dataKey: "static", name: "Static Model", color: "#a78bfa" },
                { dataKey: "adaptive", name: "Adaptive Model", color: "#34d399" },
              ]}
              xAxisKey="name"
              height={300}
            />
          )}
        </div>

        <aside className="space-y-4">
          <MapLegend metric={metric} />

          {selectedZone && selectedPerf ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6 shadow-xl">
                <div className="text-xs font-medium uppercase tracking-wide text-cyan-300">
                  Selected Zone
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-white">{selectedZone.name}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {selectedZone.borough} - Rank #{selectedZone.rank}
                </p>
              </div>

              <MetricCard
                title="Avg Demand"
                value={selectedPerf.metrics.avg_actual_demand?.toFixed(0)}
                subtitle="Trips per hour"
                accent="text-cyan-300"
              />

              <MetricCard
                title="Static sMAPE"
                value={`${selectedPerf.metrics.static_smape?.toFixed(2)}%`}
                subtitle="Without retraining"
                accent="text-violet-300"
              />

              <MetricCard
                title="Adaptive sMAPE"
                value={`${selectedPerf.metrics.adaptive_smape?.toFixed(2)}%`}
                subtitle="With drift-triggered retraining"
                accent="text-emerald-300"
              />

              <MetricCard
                title="Improvement"
                value={`${selectedPerf.metrics.improvement_pct?.toFixed(2)}%`}
                subtitle="Adaptive over static"
                accent="text-amber-300"
                trend={selectedPerf.metrics.improvement_pct > 0 ? "up" : "down"}
                trendValue={selectedPerf.metrics.improvement_pct > 0 ? "better" : "worse"}
              />

              <button
                type="button"
                onClick={() => setSelectedZone(null)}
                className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10"
              >
                Back to Top 5 Zones
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
              <div className="text-sm font-medium text-white">Top 5 Zones</div>
              <p className="mt-1 text-xs text-slate-400">By current metric ({metric})</p>
              <div className="mt-4 space-y-2">
                {topZones.map((zone, index) => (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => setSelectedZone(zone)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 p-3 text-left transition hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-white">
                          #{index + 1} {zone.name}
                        </div>
                        <div className="text-xs text-slate-400">{zone.borough}</div>
                      </div>
                      <div className="text-sm font-semibold text-cyan-300">
                        {formatMetric(metric, zone.displayValue)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Click any zone on the map for details.
              </p>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
