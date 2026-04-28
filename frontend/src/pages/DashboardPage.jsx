import { format } from "date-fns";
import LineChartCard from "../components/charts/LineChartCard";
import MetricCard from "../components/charts/MetricCard";

function formatNumber(value) {
  return value?.toLocaleString("en-US", { maximumFractionDigits: 0 }) || "n/a";
}

function getLatestRetrain(retrainEvents) {
  const latest = retrainEvents.events.at(-1);
  if (!latest) return "No retrain";
  return `${latest.model_version} on ${format(new Date(latest.timestamp), "MMM d")}`;
}

export default function DashboardPage({ data, selectedBorough, selectedZone }) {
  const { summary, predictions, weeklyComparison, retrainEvents } = data;
  const selectedZonePredictions = predictions.zones[String(selectedZone.id)]?.predictions || [];
  const latestPrediction = selectedZonePredictions.at(-1);
  const previousPrediction = selectedZonePredictions.at(-2);
  const demandTrend =
    latestPrediction && previousPrediction && previousPrediction.actual
      ? ((latestPrediction.actual - previousPrediction.actual) / previousPrediction.actual) * 100
      : null;

  const predictionChartData = selectedZonePredictions.slice(-48).map((row) => ({
    name: format(new Date(row.timestamp), "MMM d ha"),
    actual: row.actual,
    static_pred: row.static_pred,
    adaptive_pred: row.adaptive_pred,
  }));

  const weeklyChartData = weeklyComparison.weeks.map((week) => ({
    name: format(new Date(week.week_start), "MMM d"),
    static_smape: week.static.smape,
    adaptive_smape: week.adaptive.smape,
  }));

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8 shadow-2xl">
        <div className="mb-3 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
          Home Dashboard
        </div>
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Demand analytics for {selectedZone.name}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
          {selectedBorough} zone #{selectedZone.rank}, using static JSON exports from
          the completed modeling and monitoring notebooks.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Current Hour Demand"
          value={formatNumber(latestPrediction?.actual)}
          subtitle="Latest actual demand in selected zone"
          trend={demandTrend === null ? null : demandTrend >= 0 ? "up" : "down"}
          trendValue={demandTrend === null ? "n/a" : `${demandTrend.toFixed(1)}%`}
          accent="text-cyan-300"
        />
        <MetricCard
          title="MAPE"
          value={`${summary.model_performance.test_smape}%`}
          subtitle="LightGBM test sMAPE"
          trend="down"
          trendValue={`${summary.model_performance.improvement_over_baseline}%`}
          accent="text-emerald-300"
        />
        <MetricCard
          title="Model Status"
          value={summary.model_info.drift_status}
          subtitle={`Current version: ${summary.model_info.current_version}`}
          accent="text-amber-300"
        />
        <MetricCard
          title="Last Retrain"
          value={summary.model_info.current_version}
          subtitle={getLatestRetrain(retrainEvents)}
          accent="text-violet-300"
        />
      </section>

      <LineChartCard
        title="Selected Zone Hourly Demand"
        subtitle="Last 48 hours in predictions.json: actual demand, static forecast, and adaptive forecast."
        data={predictionChartData}
        xAxisKey="name"
        height={360}
        lines={[
          { dataKey: "actual", name: "Actual", color: "#22d3ee" },
          { dataKey: "static_pred", name: "Static prediction", color: "#a78bfa" },
          { dataKey: "adaptive_pred", name: "Adaptive prediction", color: "#34d399" },
        ]}
      />

      <LineChartCard
        title="Recent Performance"
        subtitle="Weekly sMAPE comparison from weekly_comparison.json."
        data={weeklyChartData}
        xAxisKey="name"
        height={320}
        lines={[
          { dataKey: "static_smape", name: "Static sMAPE", color: "#a78bfa" },
          { dataKey: "adaptive_smape", name: "Adaptive sMAPE", color: "#34d399" },
        ]}
      />
    </div>
  );
}
