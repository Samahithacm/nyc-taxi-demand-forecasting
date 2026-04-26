export default function MonitoringPage({ summary, recentPerformance }) {
  const maxError =
    recentPerformance.length > 0 ? Math.max(...recentPerformance.map((d) => d.error)) : 1;

  return (
    <div>
      <header className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl">
        <div className="mb-3 inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
          Monitoring
        </div>
        <h2 className="text-4xl font-semibold tracking-tight">Model health and drift visibility</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
          Track evaluation metrics, monitor drift state, and show when retraining may be required.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <h3 className="text-xl font-semibold">Model Performance</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-900/80 p-4">
              <div className="text-sm text-slate-400">MAPE</div>
              <div className="mt-2 text-2xl font-semibold text-emerald-300">{summary.mape}%</div>
            </div>
            <div className="rounded-2xl bg-slate-900/80 p-4">
              <div className="text-sm text-slate-400">RMSE</div>
              <div className="mt-2 text-2xl font-semibold text-cyan-300">{summary.rmse}</div>
            </div>
            <div className="rounded-2xl bg-slate-900/80 p-4">
              <div className="text-sm text-slate-400">sMAPE</div>
              <div className="mt-2 text-2xl font-semibold text-violet-300">{summary.smape}%</div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
            <div className="mb-4 text-sm text-slate-400">Recent forecast error trend</div>
            <div className="flex h-52 items-end gap-3">
              {recentPerformance.map((item) => (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-violet-500 to-fuchsia-400"
                    style={{ height: `${(item.error / maxError) * 140}px` }}
                  />
                  <div className="text-xs text-slate-300">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <h3 className="text-xl font-semibold">Operational Status</h3>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
              <div className="text-sm font-medium text-amber-300">Current Status</div>
              <div className="mt-2 text-sm text-slate-300">{summary.modelStatus}</div>
            </div>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <div className="text-sm font-medium text-cyan-300">Drift Detection</div>
              <div className="mt-2 text-sm text-slate-300">{summary.driftStatus}</div>
            </div>
            <div className="rounded-2xl border border-violet-400/20 bg-violet-400/10 p-4">
              <div className="text-sm font-medium text-violet-300">Retraining Window</div>
              <div className="mt-2 text-sm text-slate-300">
                Minimum 7 days between retrains. Latest retrain completed on {summary.lastRetrain}.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}