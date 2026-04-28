import { AlertCircle } from "lucide-react";

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-6">
      <AlertCircle className="h-12 w-12 text-red-400" />
      <div className="text-center">
        <p className="text-lg font-semibold text-white">Something went wrong</p>
        <p className="mt-2 text-sm text-slate-400">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-600"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
