import { Activity, Cpu, Home, Map, Sparkles, TrendingUp } from "lucide-react";

const ICONS = {
  Activity,
  Cpu,
  Home,
  Map,
  Sparkles,
  TrendingUp,
};

export default function Sidebar({
  navItems,
  activeSection,
  setActiveSection,
  boroughs,
  selectedBorough,
  onBoroughChange,
  zones,
  selectedZone,
  onZoneChange,
  summary,
}) {
  const driftStatus = summary?.model_info?.drift_status || "loading";
  const statusColor =
    driftStatus === "healthy"
      ? "bg-emerald-400"
      : driftStatus === "warning"
        ? "bg-amber-400"
        : "bg-red-400";

  return (
    <aside className="border-b border-neutral-800 bg-neutral-950 p-5 lg:border-b-0 lg:border-r">
      <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-5">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
          NYC Taxi Forecasting
        </div>
        <h1 className="mt-3 text-2xl font-semibold leading-tight">
          Adaptive MLOps Control Panel
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Explore current taxi demand, review model performance, and inspect monitoring health.
        </p>
      </div>

      <nav className="mt-6 space-y-2">
        {navItems.map((item) => {
          const Icon = ICONS[item.icon] || Home;

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm transition ${
                activeSection === item.id
                  ? "bg-white text-neutral-950"
                  : "border border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
              }`}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <div className="text-sm font-medium text-white">Selected Location</div>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wide text-neutral-400">
              Borough
            </label>
            <select
              value={selectedBorough}
              onChange={(event) => onBoroughChange(event.target.value)}
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-cyan-400"
            >
              {boroughs.map((borough) => (
                <option key={borough} value={borough}>
                  {borough}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-wide text-neutral-400">
              Zone
            </label>
            <select
              value={selectedZone || ""}
              onChange={(event) => onZoneChange(event.target.value)}
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-cyan-400"
            >
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  #{zone.rank} {zone.name} ({Math.round(zone.total_demand / 1000)}k)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <div className="text-sm font-medium text-white">Model Status</div>
        <div className="mt-4 space-y-3 text-sm text-neutral-300">
          <div className="flex items-center justify-between gap-3">
            <span className="text-neutral-400">Version</span>
            <span>{summary?.model_info?.current_version || "loading"}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-neutral-400">Updated</span>
            <span>{summary?.model_info?.trained_at || "loading"}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-neutral-400">Drift</span>
            <span className="inline-flex items-center gap-2 capitalize">
              <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`} />
              {driftStatus}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
