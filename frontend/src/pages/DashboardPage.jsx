import StatCard from "../components/StatCard";

export default function DashboardPage({
  selectedBorough,
  selectedZone,
  summary,
  hourlyForecast,
}) {
  const maxForecast =
    hourlyForecast.length > 0 ? Math.max(...hourlyForecast.map((d) => d.demand)) : 1;

  return (
    <div>
      <header className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8 shadow-2xl">
        <div className="mb-3 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
          Home Dashboard
        </div>
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Demand analytics for {selectedZone}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
          Use the selected borough and zone to inspect current demand, near-term forecasts,
          and production-style model analytics for the NYC taxi forecasting system.
        </p>
      </header>

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Current Hour Demand"
          value={`${summary.currentHourDemand}`}
          subtitle={`${summary.demandChangePct}% above recent average`}
          accent="text-cyan-300"
        />
        <StatCard
          title="MAPE"
          value={`${summary.mape}%`}
          subtitle="Latest evaluation window"
          accent="text-emerald-300"
        />
        <StatCard
          title="Model Status"
          value={summary.modelStatus}
          subtitle={summary.driftStatus}
          accent="text-amber-300"
        />
        <StatCard
          title="Last Retrain"
          value="Recent"
          subtitle={summary.lastRetrain}
          accent="text-violet-300"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Demand Forecast</h3>
              <p className="mt-1 text-sm text-slate-400">
                Projected demand trend for the next few hours in the selected zone.
              </p>
            </div>
            <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
              Preview mode
            </div>
          </div>

          <div className="flex h-72 items-end gap-3 rounded-2xl bg-slate-900/80 p-4">
            {hourlyForecast.map((item) => (
              <div key={item.hour} className="flex flex-1 flex-col items-center justify-end gap-3">
                <div className="text-xs text-slate-400">{item.demand}</div>
                <div
                  className="w-full rounded-t-2xl bg-gradient-to-t from-cyan-500 to-blue-400"
                  style={{ height: `${(item.demand / maxForecast) * 180}px` }}
                />
                <div className="text-sm text-slate-300">{item.hour}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <h3 className="text-xl font-semibold">Quick Insights</h3>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
              <div className="text-sm text-slate-400">Selected Borough</div>
              <div className="mt-2 text-lg font-medium">{selectedBorough}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
              <div className="text-sm text-slate-400">Selected Zone</div>
              <div className="mt-2 text-lg font-medium">{selectedZone}</div>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
              <div className="text-sm font-medium text-emerald-300">Monitoring Summary</div>
              <div className="mt-2 text-sm leading-6 text-slate-300">
                No alert-level drift has been detected for this zone. Current model metrics remain within target thresholds.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}