import BarChartCard from "../components/charts/BarChartCard";
import MetricCard from "../components/charts/MetricCard";

export default function ModelPage({ data }) {
  const { summary, weeklyComparison } = data;

  const featureRows = summary.model_info.top_features.map((feature, index, features) => ({
    name: feature,
    importance: features.length - index,
  }));

  const performanceRows = [
    {
      metric: "Test sMAPE",
      value: `${summary.model_performance.test_smape}%`,
      context: "LightGBM holdout set",
    },
    {
      metric: "Test RMSE",
      value: summary.model_performance.test_rmse,
      context: "LightGBM holdout set",
    },
    {
      metric: "Test MAE",
      value: summary.model_performance.test_mae,
      context: "LightGBM holdout set",
    },
    {
      metric: "Static Avg sMAPE",
      value: `${summary.simulation_results.static_avg_smape}%`,
      context: "Production simulation",
    },
    {
      metric: "Adaptive Avg sMAPE",
      value: `${summary.simulation_results.adaptive_avg_smape}%`,
      context: "Production simulation",
    },
    {
      metric: "Paired t-test p-value",
      value: summary.simulation_results.p_value,
      context: summary.simulation_results.is_significant ? "Significant" : "Not significant",
    },
  ];

  const settings = [
    { label: "Model Type", value: summary.model_info.model_type },
    { label: "Current Version", value: summary.model_info.current_version },
    { label: "Training Period", value: summary.data_info.training_period },
    { label: "Simulation Period", value: summary.data_info.simulation_period },
    { label: "Modeled Zones", value: summary.data_info.zones_count },
    { label: "Demand Coverage", value: `${summary.data_info.demand_coverage_pct}%` },
  ];

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl">
        <div className="mb-3 inline-flex items-center rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-300">
          Model Section
        </div>
        <h2 className="text-4xl font-semibold tracking-tight">Model architecture and performance</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
          A LightGBM demand forecasting pipeline trained on lag, rolling, time, zone, and
          borough features, with adaptive retraining evaluated in production simulation.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Model Type"
          value={summary.model_info.model_type}
          subtitle="Gradient boosted decision trees"
          accent="text-violet-300"
        />
        <MetricCard
          title="Test sMAPE"
          value={`${summary.model_performance.test_smape}%`}
          subtitle={`${summary.model_performance.improvement_over_baseline}% better than baseline`}
          trend="down"
          trendValue={`${summary.model_performance.improvement_over_baseline}%`}
          accent="text-emerald-300"
        />
        <MetricCard
          title="Adaptive Lift"
          value={`${summary.simulation_results.improvement_pct}%`}
          subtitle={`${summary.simulation_results.total_weeks} weekly windows`}
          trend="up"
          trendValue={`p=${summary.simulation_results.p_value}`}
          accent="text-cyan-300"
        />
        <MetricCard
          title="Retrains"
          value={summary.simulation_results.total_retrains}
          subtitle={`Current: ${summary.model_info.current_version}`}
          accent="text-amber-300"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <h3 className="text-xl font-semibold text-white">Architecture Summary</h3>
          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
              <div className="text-sm text-slate-400">Algorithm</div>
              <div className="mt-2 text-base font-medium text-white">LightGBM Regressor</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
              <div className="text-sm text-slate-400">Core Hyperparameters</div>
              <div className="mt-2 text-sm leading-6 text-slate-300">
                num_leaves=63, learning_rate=0.05, n_estimators=1000, min_child_samples=50,
                feature_fraction=0.9, bagging_fraction=0.8
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
              <div className="text-sm text-slate-400">Forecast Target</div>
              <div className="mt-2 text-base font-medium text-white">Next-hour pickup demand by zone</div>
            </div>
          </div>
        </div>

        <BarChartCard
          title="Top Features"
          subtitle="Ranked feature list from summary.json. Higher bars indicate higher exported importance rank."
          data={featureRows}
          xAxisKey="name"
          height={340}
          bars={[{ dataKey: "importance", name: "Importance rank", color: "#22d3ee" }]}
          showLegend={false}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <h3 className="text-xl font-semibold text-white">Performance Metrics</h3>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-white/10 text-slate-400">
                <tr>
                  <th className="py-3 pr-4 font-medium">Metric</th>
                  <th className="py-3 pr-4 font-medium">Value</th>
                  <th className="py-3 pr-4 font-medium">Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {performanceRows.map((row) => (
                  <tr key={row.metric}>
                    <td className="py-3 pr-4 text-white">{row.metric}</td>
                    <td className="py-3 pr-4 text-cyan-300">{row.value}</td>
                    <td className="py-3 pr-4 text-slate-300">{row.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <h3 className="text-xl font-semibold text-white">Settings</h3>
          <div className="mt-5 space-y-4">
            {settings.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                <div className="text-sm text-slate-400">{item.label}</div>
                <div className="mt-2 text-base font-medium text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-sm leading-6 text-emerald-100">
        The adaptive strategy averaged {summary.simulation_results.adaptive_avg_smape}% sMAPE
        versus {summary.simulation_results.static_avg_smape}% for the static model across{" "}
        {weeklyComparison.weeks.length} weekly simulation windows.
      </div>
    </div>
  );
}
