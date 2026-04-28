import { useMemo } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from "react-leaflet";

const NYC_CENTER = [40.7589, -73.9851];
const DEFAULT_ZOOM = 11;

function formatValue(metric, value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "n/a";
  if (metric === "demand") return value.toLocaleString("en-US");
  return `${value.toFixed(2)}%`;
}

/**
 * Interactive Leaflet map for top NYC taxi zones.
 *
 * @param {object} props
 * @param {Array<object>} props.zones Zone records with latitude and longitude.
 * @param {object} props.zonePerformance Per-zone model performance payload.
 * @param {"demand"|"accuracy"|"improvement"} props.metric Active map metric.
 * @param {(zone: object) => void} props.onZoneSelect Zone click callback.
 * @param {number|null} props.selectedZoneId Currently selected zone id.
 */
export default function NYCZoneMap({
  zones,
  zonePerformance,
  metric = "demand",
  onZoneSelect,
  selectedZoneId,
}) {
  const performanceByZone = useMemo(() => {
    const entries = zonePerformance?.zones || [];
    return new Map(entries.map((item) => [item.zone_id, item]));
  }, [zonePerformance]);

  const getMetricValue = useMemo(
    () => (zone) => {
      const perf = performanceByZone.get(zone.id);
      if (metric === "accuracy") return perf?.metrics?.adaptive_smape ?? 0;
      if (metric === "improvement") return perf?.metrics?.improvement_pct ?? 0;
      return zone.total_demand ?? 0;
    },
    [metric, performanceByZone]
  );

  const { min, max, demandMax } = useMemo(() => {
    const values = zones.map((zone) => getMetricValue(zone));
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      demandMax: Math.max(...zones.map((zone) => zone.total_demand || 0)),
    };
  }, [getMetricValue, zones]);

  const getColor = useMemo(
    () => (value) => {
      const spread = max - min || 1;
      const ratio = (value - min) / spread;

      if (metric === "accuracy") {
        if (ratio < 0.33) return "#10b981";
        if (ratio < 0.66) return "#f59e0b";
        return "#ef4444";
      }

      if (ratio < 0.33) return "#67e8f9";
      if (ratio < 0.66) return "#06b6d4";
      return "#0891b2";
    },
    [max, metric, min]
  );

  function getRadius(zone) {
    const ratio = demandMax ? zone.total_demand / demandMax : 0;
    return 8 + ratio * 25;
  }

  return (
    <MapContainer
      center={NYC_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: "600px", width: "100%", borderRadius: "1rem" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {zones.map((zone) => {
        const perf = performanceByZone.get(zone.id);
        const value = getMetricValue(zone);
        const color = getColor(value);
        const isSelected = selectedZoneId === zone.id;

        return (
          <CircleMarker
            key={zone.id}
            center={[zone.latitude, zone.longitude]}
            radius={getRadius(zone)}
            pathOptions={{
              color: isSelected ? "#ffffff" : color,
              fillColor: color,
              fillOpacity: isSelected ? 0.9 : 0.72,
              weight: isSelected ? 4 : 1.5,
            }}
            eventHandlers={{
              click: () => onZoneSelect(zone),
            }}
          >
            <Tooltip>
              <strong>{zone.name}</strong>
              <br />
              {zone.borough}
              <br />
              {metric === "accuracy" && `sMAPE: ${formatValue(metric, perf?.metrics?.adaptive_smape)}`}
              {metric === "improvement" &&
                `Improvement: ${formatValue(metric, perf?.metrics?.improvement_pct)}`}
              {metric === "demand" && `Total demand: ${formatValue(metric, zone.total_demand)}`}
            </Tooltip>
            <Popup>
              <div className="font-semibold">{zone.name}</div>
              <div>Borough: {zone.borough}</div>
              <div>Rank: #{zone.rank}</div>
              <div>Click for details</div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
