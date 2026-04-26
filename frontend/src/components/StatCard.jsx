export default function StatCard({ title, value, subtitle, accent }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm">
      <div className="text-sm text-slate-400">{title}</div>
      <div className={`mt-2 text-3xl font-semibold ${accent || "text-white"}`}>{value}</div>
      <div className="mt-2 text-sm text-slate-400">{subtitle}</div>
    </div>
  );
}