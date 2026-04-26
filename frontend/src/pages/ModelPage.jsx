export default function ModelPage({ modelFunctions, modelSettings }) {
  return (
    <div>
      <header className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl">
        <div className="mb-3 inline-flex items-center rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-300">
          Model Section
        </div>
        <h2 className="text-4xl font-semibold tracking-tight">Model functions and settings</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
          This section explains what the forecasting model does now and what settings can be exposed later when backend integration is ready.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <h3 className="text-xl font-semibold">Model Functions</h3>
          <div className="mt-5 space-y-3">
            {modelFunctions.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <h3 className="text-xl font-semibold">Settings Preview</h3>
          <div className="mt-5 space-y-4">
            {modelSettings.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                <div className="text-sm text-slate-400">{item.label}</div>
                <div className="mt-2 text-base font-medium text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}