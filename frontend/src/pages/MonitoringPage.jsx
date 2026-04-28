import { format } from "date-fns";
import { ReferenceLine } from "recharts";
import LineChartCard from "../components/charts/LineChartCard";
import MetricCard from "../components/charts/MetricCard";

export default function MonitoringPage({ data }) {
  const { summary, driftMetrics, weeklyComparison, retrainEvents } = data;

  const psiChartData = driftMetrics.timeseries.map((week) => ({
    name: format(new Date(week.week_start), "MMM d"),
    ...week.psi_scores,
  }));

  const weeklySmapeData = weeklyComparison.weeks.map((week) => ({
    name: format(new Date(week.week_start), "MMM d"),
    static_smape: week.static.smape,
    adaptive_smape: week.adaptive.smape,
  }));

  const featureColors = ["#22d3ee", "#a78bfa", "#34d399", "#f59e0b", "#f472b6"];

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl">
        <div className="mb-3 inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
          Monitoring
        </div>
        <h2 className="text-4xl font-semibold tracking-tight">Model health and drift visibility</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
          Weekly production simulation outputs with PSI drift signals, static-versus-adaptive
          error, and retrain events from real JSON exports.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="WAPE"
          value={`${summary.model_performance.test_wape}%`}
          subtitle="Weighted absolute percentage error"
          accent="text-emerald-300"
        />
        <MetricCard
          title="RMSE"
          value={summary.model_performance.test_rmse}
          subtitle="LightGBM test RMSE"
          accent="text-cyan-300"
        />
        <MetricCard
          title="sMAPE"
          value={`${summary.model_performance.test_smape}%`}
          subtitle={`${summary.simulation_results.total_retrains} adaptive retrains`}
          accent="text-violet-300"
        />
      </section>

      <LineChartCard
        title="Drift Detection"
        subtitle="Population Stability Index by important model feature. Warning starts at 0.1; alert starts at 0.2."
        data={psiChartData}
        xAxisKey="name"
        height={360}
        lines={driftMetrics.features.map((feature, index) => ({
          dataKey: feature,
          name: feature,
          color: featureColors[index % featureColors.length],
        }))}
      >
        <ReferenceLine y={driftMetrics.thresholds.warning} stroke="#f59e0b" strokeDasharray="4 4" />
        <ReferenceLine y={driftMetrics.thresholds.alert} stroke="#ef4444" strokeDasharray="4 4" />
      </LineChartCard>

      <LineChartCard
        title="Recent Performance"
        subtitle="Weekly sMAPE: static model versus adaptive retraining policy."
        data={weeklySmapeData}
        xAxisKey="name"
        height={330}
        lines={[
          { dataKey: "static_smape", name: "Static sMAPE", color: "#a78bfa" },
          { dataKey: "adaptive_smape", name: "Adaptive sMAPE", color: "#34d399" },
        ]}
      />

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-white">Recent Retrain Events</h3>
          <p className="mt-1 text-sm text-slate-400">
            Trigger reasons, promoted model versions, and post-event improvement estimates.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/10 text-slate-400">
              <tr>
                <th className="py-3 pr-4 font-medium">Date</th>
                <th className="py-3 pr-4 font-medium">Version</th>
                <th className="py-3 pr-4 font-medium">Trigger reason</th>
                <th className="py-3 pr-4 text-right font-medium">Improvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {retrainEvents.events.map((event) => (
                <tr key={event.id}>
                  <td className="py-3 pr-4 text-white">
                    {format(new Date(event.timestamp), "MMM d, yyyy")}
                  </td>
                  <td className="py-3 pr-4 text-cyan-300">{event.model_version}</td>
                  <td className="py-3 pr-4 text-slate-300">{event.trigger_reason}</td>
                  <td className="py-3 pr-4 text-right text-emerald-300">
                    {event.improvement_after === null ? "n/a" : `${event.improvement_after}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
