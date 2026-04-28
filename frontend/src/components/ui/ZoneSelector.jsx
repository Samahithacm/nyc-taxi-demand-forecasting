import { useMemo } from "react";

/**
 * Borough and zone selector shared by interactive pages.
 *
 * @param {object} props
 * @param {Array<string>} props.boroughs Available borough names.
 * @param {Array<object>} props.zones All modeled zone records.
 * @param {string} props.selectedBorough Active borough name.
 * @param {(borough: string) => void} props.onBoroughChange Borough change handler.
 * @param {number|string|null} props.selectedZone Active zone id.
 * @param {(zoneId: number) => void} props.onZoneChange Zone change handler.
 */
export default function ZoneSelector({
  boroughs,
  zones,
  selectedBorough,
  onBoroughChange,
  selectedZone,
  onZoneChange,
}) {
  const filteredZones = useMemo(
    () =>
      zones
        .filter((zone) => zone.borough === selectedBorough)
        .sort((a, b) => a.rank - b.rank),
    [zones, selectedBorough]
  );

  return (
    <div className="grid gap-4 md:grid-cols-[0.75fr_1.25fr]">
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
          Borough
        </label>
        <select
          value={selectedBorough}
          onChange={(event) => onBoroughChange(event.target.value)}
          className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
        >
          {boroughs.map((borough) => (
            <option key={borough} value={borough}>
              {borough}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
          Zone
        </label>
        <select
          value={selectedZone || ""}
          onChange={(event) => onZoneChange(Number(event.target.value))}
          className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
        >
          {filteredZones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              #{zone.rank} {zone.name} ({zone.borough})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
