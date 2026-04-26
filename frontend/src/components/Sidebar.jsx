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
}) {
  return (
    <aside className="border-b border-white/10 bg-slate-950/95 p-6 lg:border-b-0 lg:border-r">
      <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
        <div className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-300">
          NYC Taxi Forecasting
        </div>
        <h1 className="mt-3 text-2xl font-semibold leading-tight">
          Adaptive MLOps Control Panel
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Explore current taxi demand, review model performance, and inspect monitoring health.
        </p>
      </div>

      <nav className="mt-8 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
              activeSection === item.id
                ? "bg-white text-slate-950"
                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm font-medium text-white">Selected Location</div>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wide text-slate-400">
              Borough
            </label>
            <select
              value={selectedBorough}
              onChange={(event) => onBoroughChange(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none"
            >
              {boroughs.map((borough) => (
                <option key={borough} value={borough}>
                  {borough}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-wide text-slate-400">
              Zone
            </label>
            <select
              value={selectedZone}
              onChange={(event) => onZoneChange(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none"
            >
              {zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
}
