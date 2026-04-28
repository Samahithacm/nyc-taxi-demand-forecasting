import { useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import BarChartCard from "../components/charts/BarChartCard";
import LineChartCard from "../components/charts/LineChartCard";
import MetricCard from "../components/charts/MetricCard";
import DateRangePicker from "../components/ui/DateRangePicker";
import ZoneSelector from "../components/ui/ZoneSelector";

function toDateInput(value) {
  return format(new Date(value), "yyyy-MM-dd");
}

function smape(actual, predicted) {
  if (actual === 0 && predicted === 0) return 0;
  return (200 * Math.abs(predicted - actual)) / (Math.abs(actual) + Math.abs(predicted));
}

function formatNumber(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return "n/a";
  return value.toLocaleString("en-US", { maximumFractionDigits: digits });
}

function getDefaultRange(predictionsData) {
  const timestamps = Object.values(predictionsData?.zones || {})
    .flatMap((zone) => zone.predictions.map((row) => row.timestamp))
    .sort();
  const end = timestamps.at(-1) || "2024-03-31T00:00:00";
  return {
    start: toDateInput(subDays(new Date(end), 6)),
    end: toDateInput(end),
  };
}

/**
 * Historical prediction explorer with zone, date, and model filters.
 *
 * @param {object} props
 * @param {Array<object>} props.zones Modeled taxi zones.
 * @param {Array<string>} props.boroughs Modeled borough names.
 * @param {object} props.predictionsData Exported predictions JSON.
 */
export default function ForecastExplorerPage({ zones, boroughs, predictionsData }) {
  const defaultRange = useMemo(() => getDefaultRange(predictionsData), [predictionsData]);
  const [selectedBorough, setSelectedBorough] = useState(boroughs[0] || "");
  const [selectedZone, setSelectedZone] = useState(zones[0]?.id || null);
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [modelMode, setModelMode] = useState("both");
  const [showActual, setShowActual] = useState(true);

  const selectedZoneRows = useMemo(
    () => predictionsData?.zones?.[String(selectedZone)]?.predictions || [],
    [predictionsData, selectedZone]
  );

  const filteredRows = useMemo(
    () =>
      selectedZoneRows.filter((row) => {
        const date = row.timestamp.slice(0, 10);
        return date >= startDate && date <= endDate;
      }),
    [endDate, selectedZoneRows, startDate]
  );

  const chartData = useMemo(
    () =>
      filteredRows.map((row) => ({
        name: format(new Date(row.timestamp), "MMM d ha"),
        timestamp: row.timestamp,
        actual: row.actual,
        static_pred: row.static_pred,
        adaptive_pred: row.adaptive_pred,
      })),
    [filteredRows]
  );

  const lines = useMemo(() => {
    const nextLines = [];
    if (showActual) nextLines.push({ dataKey: "actual", name: "Actual", color: "#22d3ee" });
    if (modelMode === "static" || modelMode === "both") {
      nextLines.push({ dataKey: "static_pred", name: "Static prediction", color: "#a78bfa" });
    }
    if (modelMode === "adaptive" || modelMode === "both") {
      nextLines.push({ dataKey: "adaptive_pred", name: "Adaptive prediction", color: "#34d399" });
    }
    return nextLines;
  }, [modelMode, showActual]);

  const primaryPredictionKey = modelMode === "static" ? "static_pred" : "adaptive_pred";
  const primaryPredictionName = modelMode === "static" ? "Static" : "Adaptive";

  const stats = useMemo(() => {
    if (!filteredRows.length) {
      return {
        total: 0,
        avgSmape: null,
        best: null,
        worst: null,
      };
    }

    const scored = filteredRows.map((row) => ({
      timestamp: row.timestamp,
      actual: row.actual,
      predicted: row[primaryPredictionKey],
      smape: smape(row.actual, row[primaryPredictionKey]),
      absError: Math.abs(row[primaryPredictionKey] - row.actual),
    }));

    return {
      total: filteredRows.length,
      avgSmape: scored.reduce((sum, row) => sum + row.smape, 0) / scored.length,
      best: scored.reduce((best, row) => (row.absError < best.absError ? row : best), scored[0]),
      worst: scored.reduce((worst, row) => (row.absError > worst.absError ? row : worst), scored[0]),
    };
  }, [filteredRows, primaryPredictionKey]);

  const errorHistogram = useMemo(() => {
    if (!filteredRows.length) return [];
    const errors = filteredRows.map((row) => row[primaryPredictionKey] - row.actual);
    const min = Math.floor(Math.min(...errors) / 10) * 10;
    const max = Math.ceil(Math.max(...errors) / 10) * 10;
    const binCount = 10;
    const width = Math.max(1, (max - min) / binCount);
    const bins = Array.from({ length: binCount }, (_, index) => ({
      range: `${Math.round(min + index * width)} to ${Math.round(min + (index + 1) * width)}`,
      count: 0,
    }));

    errors.forEach((error) => {
      const index = Math.min(binCount - 1, Math.max(0, Math.floor((error - min) / width)));
      bins[index].count += 1;
    });
    return bins;
  }, [filteredRows, primaryPredictionKey]);

  const hourlyDemand = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      total: 0,
      count: 0,
    }));

    filteredRows.forEach((row) => {
      const hour = new Date(row.timestamp).getHours();
      buckets[hour].total += row.actual;
      buckets[hour].count += 1;
    });

    return buckets.map((bucket) => ({
      hour: bucket.hour,
      avg_demand: bucket.count ? Math.round(bucket.total / bucket.count) : 0,
    }));
  }, [filteredRows]);

  function handleBoroughChange(nextBorough) {
    setSelectedBorough(nextBorough);
    const firstZone = zones
      .filter((zone) => zone.borough === nextBorough)
      .sort((a, b) => a.rank - b.rank)[0];
    setSelectedZone(firstZone?.id || null);
  }

  const hasValidRange = startDate && endDate && startDate <= endDate;

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl">
        <div className="mb-3 inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
          Forecast Explorer
        </div>
        <h2 className="text-4xl font-semibold tracking-tight">Historical prediction analysis</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
          Filter model predictions by zone and period, compare static and adaptive forecasts,
          and inspect where errors concentrate.
        </p>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr_0.7fr]">
          <ZoneSelector
            boroughs={boroughs}
            zones={zones}
            selectedBorough={selectedBorough}
            onBoroughChange={handleBoroughChange}
            selectedZone={selectedZone}
            onZoneChange={setSelectedZone}
          />

          <DateRangePicker
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
          />

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
              Model lines
            </label>
            <div className="grid grid-cols-3 overflow-hidden rounded-md border border-white/10">
              {[
                { value: "static", label: "Static" },
                { value: "adaptive", label: "Adaptive" },
                { value: "both", label: "Both" },
              ].map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setModelMode(mode.value)}
                  className={`px-3 py-3 text-sm font-medium transition ${
                    modelMode === mode.value
                      ? "bg-cyan-400 text-slate-950"
                      : "bg-slate-950 text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={showActual}
                onChange={(event) => setShowActual(event.target.checked)}
                className="h-4 w-4 accent-cyan-400"
              />
              Show actual demand
            </label>
          </div>
        </div>
      </section>

      {!hasValidRange && (
        <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-5 text-sm text-red-100">
          Choose a valid date range where the start date is before the end date.
        </div>
      )}

      {hasValidRange && (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Total predictions"
              value={formatNumber(stats.total)}
              subtitle="Hourly rows in current filter"
              accent="text-cyan-300"
            />
            <MetricCard
              title={`Avg sMAPE (${primaryPredictionName})`}
              value={stats.avgSmape === null ? "n/a" : `${stats.avgSmape.toFixed(1)}%`}
              subtitle="Lower is better"
              accent="text-emerald-300"
            />
            <MetricCard
              title="Best prediction"
              value={stats.best ? formatNumber(stats.best.absError, 1) : "n/a"}
              subtitle={stats.best ? format(new Date(stats.best.timestamp), "MMM d, ha") : "No data"}
              accent="text-violet-300"
            />
            <MetricCard
              title="Worst prediction"
              value={stats.worst ? formatNumber(stats.worst.absError, 1) : "n/a"}
              subtitle={stats.worst ? format(new Date(stats.worst.timestamp), "MMM d, ha") : "No data"}
              accent="text-amber-300"
            />
          </section>

          {filteredRows.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-300">
              No predictions found for the selected zone and date range.
            </div>
          ) : (
            <>
              <LineChartCard
                title="Hourly actual demand and forecasts"
                subtitle="Hover any point to inspect exact actual, static, and adaptive values."
                data={chartData}
                xAxisKey="name"
                height={430}
                lines={lines}
              />

              <section className="grid gap-6 xl:grid-cols-2">
                <BarChartCard
                  title="How accurate were predictions?"
                  subtitle={`${primaryPredictionName} prediction error distribution. Positive bins are over-predictions.`}
                  data={errorHistogram}
                  xAxisKey="range"
                  height={330}
                  bars={[{ dataKey: "count", name: "Predictions", color: "#a78bfa" }]}
                  showLegend={false}
                />

                <BarChartCard
                  title="Average demand by hour"
                  subtitle="Actual hourly demand averaged over the current filter."
                  data={hourlyDemand}
                  xAxisKey="hour"
                  height={330}
                  bars={[{ dataKey: "avg_demand", name: "Avg demand", color: "#22d3ee" }]}
                  showLegend={false}
                />
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
