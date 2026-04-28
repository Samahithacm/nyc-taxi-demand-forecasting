export default function LoadingState({ message = "Loading..." }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400"></div>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
