/**
 * Two-field date range control.
 *
 * @param {object} props
 * @param {string} props.startDate Start date in yyyy-mm-dd format.
 * @param {(value: string) => void} props.onStartDateChange Start date change handler.
 * @param {string} props.endDate End date in yyyy-mm-dd format.
 * @param {(value: string) => void} props.onEndDateChange End date change handler.
 */
export default function DateRangePicker({
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
          Start date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(event) => onStartDateChange(event.target.value)}
          className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
          End date
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(event) => onEndDateChange(event.target.value)}
          className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
        />
      </div>
    </div>
  );
}
