import { useEffect, useMemo, useState } from "react";
import { Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import BarChartCard from "../components/charts/BarChartCard";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import ZoneSelector from "../components/ui/ZoneSelector";
import { checkAPIHealth, getPredictionLookup, predictFromAPI } from "../services/taxiApi";

const DAY_OPTIONS = [
  { value: 0, label: "Mon" },
  { value: 1, label: "Tue" },
  { value: 2, label: "Wed" },
  { value: 3, label: "Thu" },
  { value: 4, label: "Fri" },
  { value: 5, label: "Sat" },
  { value: 6, label: "Sun" },
];

const CATEGORY_STYLES = {
  Low: "border-slate-400/30 bg-slate-400/10 text-slate-200",
  Medium: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  High: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  "Very High": "border-red-400/30 bg-red-400/10 text-red-200",
};

const API_STATUS_STYLES = {
  checking: "border-slate-400/30 bg-slate-400/10 text-slate-200",
  online: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  fallback: "border-amber-400/30 bg-amber-400/10 text-amber-200",
};

const API_STATUS_LABELS = {
  checking: "Checking API",
  online: "Live API",
  fallback: "Cached Data",
};

function formatHour(hour) {
  return new Date(2024, 0, 1, hour).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatTrips(value) {
  return Math.round(value).toLocaleString("en-US");
}

/**
 * Interactive lookup-backed future demand prediction page.
 *
 * @param {object} props
 * @param {Array<object>} props.zones Modeled taxi zones.
 * @param {Array<string>} props.boroughs Modeled borough names.
 */
export default function LivePredictionPage({ zones, boroughs }) {
  const [selectedBorough, setSelectedBorough] = useState(boroughs[0] || "");
  const [selectedZone, setSelectedZone] = useState(zones[0]?.id || null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedHour, setSelectedHour] = useState(12);
  const [prediction, setPrediction] = useState(null);
  const [predictionLookup, setPredictionLookup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadLookup() {
      try {
        setLoading(true);
        setError(null);
        const lookup = await getPredictionLookup();
        if (!ignore) setPredictionLookup(lookup);
      } catch (lookupError) {
        if (!ignore) setError(lookupError.message || "Unable to load prediction lookup.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadLookup();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadAPIStatus() {
      const health = await checkAPIHealth();
      if (!ignore) setApiStatus(health.model_loaded ? "online" : "fallback");
    }

    loadAPIStatus();
    return () => {
      ignore = true;
    };
  }, []);

  const selectedZoneObject = useMemo(
    () => zones.find((zone) => zone.id === Number(selectedZone)) || null,
    [zones, selectedZone]
  );

  const hourlyChartData = useMemo(() => {
    if (!predictionLookup || !selectedZone) return [];
    return Array.from({ length: 24 }, (_, hour) => {
      const item = predictionLookup.predictions[`${selectedZone}_${hour}_${selectedDay}`];
      return {
        hour: formatHour(hour),
        demand: item?.predicted_demand || 0,
        barColor: hour === selectedHour ? "#22d3ee" : "#334155",
      };
    });
  }, [predictionLookup, selectedDay, selectedHour, selectedZone]);

  const topZones = useMemo(() => {
    if (!predictionLookup) return [];
    return Object.values(predictionLookup.predictions)
      .filter((item) => item.hour === selectedHour && item.day_of_week === selectedDay)
      .sort((a, b) => b.predicted_demand - a.predicted_demand)
      .slice(0, 5);
  }, [predictionLookup, selectedDay, selectedHour]);

  function handleBoroughChange(nextBorough) {
    setSelectedBorough(nextBorough);
    const firstZone = zones
      .filter((zone) => zone.borough === nextBorough)
      .sort((a, b) => a.rank - b.rank)[0];
    setSelectedZone(firstZone?.id || null);
    setPrediction(null);
  }

  async function handlePredict() {
    if (!selectedZone) return;

    try {
      setPredictionLoading(true);
      setPredictionError(null);
      const result = await predictFromAPI(selectedZone, selectedHour, selectedDay);
      setPrediction(result);
    } catch (predictError) {
      setPrediction(null);
      setPredictionError(
        predictError.message || "Unable to generate prediction for this scenario."
      );
    } finally {
      setPredictionLoading(false);
    }
  }

  const categoryClass = CATEGORY_STYLES[prediction?.demand_category] || CATEGORY_STYLES.Medium;
  const vsHistorical = prediction?.vs_historical_pct || 0;
  const isAboveHistorical = vsHistorical >= 0;

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 p-8 shadow-2xl">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
            <Sparkles size={14} />
            Live Prediction
          </span>
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${API_STATUS_STYLES[apiStatus]}`}
          >
            {API_STATUS_LABELS[apiStatus]}
          </span>
        </div>
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">Predict Taxi Demand</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
          Get demand forecasts for any NYC zone at any time using pre-computed LightGBM
          predictions for typical historical patterns.
        </p>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white">Prediction inputs</h3>
          <p className="mt-1 text-sm text-slate-400">
            Choose a zone, day, and hour, then run the lookup-backed forecast.
          </p>
        </div>

        <div className="space-y-6">
          <ZoneSelector
            boroughs={boroughs}
            zones={zones}
            selectedBorough={selectedBorough}
            onBoroughChange={handleBoroughChange}
            selectedZone={selectedZone}
            onZoneChange={(zoneId) => {
              setSelectedZone(zoneId);
              setPrediction(null);
            }}
          />

          <div>
            <label className="mb-3 block text-xs font-medium uppercase tracking-wide text-slate-400">
              Day of week
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {DAY_OPTIONS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => {
                    setSelectedDay(day.value);
                    setPrediction(null);
                  }}
                  className={`rounded-md border px-4 py-3 text-sm font-medium transition ${
                    selectedDay === day.value
                      ? "border-cyan-400 bg-cyan-400 text-slate-950"
                      : "border-white/10 bg-slate-950 text-slate-300 hover:border-cyan-400/60"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                Hour of day
              </label>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-200">
                {formatHour(selectedHour)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="23"
              step="1"
              value={selectedHour}
              onChange={(event) => {
                setSelectedHour(Number(event.target.value));
                setPrediction(null);
              }}
              className="h-2 w-full cursor-pointer accent-cyan-400"
            />
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>12:00 AM</span>
              <span>11:00 PM</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePredict}
            disabled={!selectedZone || predictionLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-400 px-5 py-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 sm:w-auto"
          >
            <Sparkles size={18} />
            {predictionLoading ? "Predicting..." : "Predict Demand"}
          </button>
        </div>
      </section>

      {loading && <LoadingState message="Loading prediction lookup..." />}
      {!loading && error && <ErrorState message={error} />}
      {predictionLoading && <LoadingState message="Requesting prediction..." />}
      {predictionError && <ErrorState message={predictionError} />}

      {!predictionLoading && !predictionError && !prediction && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-300">
          Select a scenario and press Predict Demand to view the forecast.
        </div>
      )}

      {!predictionLoading && prediction && (
        <section className="space-y-6 transition-all duration-300">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-8 shadow-2xl">
              <div className="text-sm font-medium text-cyan-200">
                {prediction.zone_name} - {prediction.day_name} at {formatHour(prediction.hour)}
              </div>
              <div className="mt-4 text-6xl font-semibold tracking-tight text-white">
                {formatTrips(prediction.predicted_demand)}
                <span className="ml-3 text-2xl text-cyan-200">trips/hour</span>
              </div>
              <div className="mt-4 text-sm text-cyan-100">
                Range: {formatTrips(prediction.confidence_lower)} -{" "}
                {formatTrips(prediction.confidence_upper)} trips/hour (95% confidence)
              </div>
              <div className="mt-6">
                <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${categoryClass}`}>
                  {prediction.demand_category}
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
                <div className="text-sm text-slate-400">Compared with historical average</div>
                <div
                  className={`mt-3 flex items-center gap-2 text-3xl font-semibold ${
                    isAboveHistorical ? "text-emerald-300" : "text-red-300"
                  }`}
                >
                  {isAboveHistorical ? <TrendingUp size={26} /> : <TrendingDown size={26} />}
                  {isAboveHistorical ? "+" : ""}
                  {vsHistorical.toFixed(1)}%
                </div>
                <div className="mt-2 text-sm text-slate-400">
                  Historical average: {formatTrips(prediction.historical_avg)} trips/hour
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
                <h3 className="text-xl font-semibold text-white">Why this prediction?</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  {prediction.explanation_factors.map((factor) => (
                    <li key={factor} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <BarChartCard
            title={`Hourly forecast for ${selectedZoneObject?.name || "selected zone"}`}
            subtitle={`${DAY_OPTIONS[selectedDay].label} pattern with the selected hour highlighted.`}
            data={hourlyChartData}
            xAxisKey="hour"
            height={340}
            bars={[
              { dataKey: "demand", name: "Predicted demand", color: "#334155", colorKey: "barColor" },
            ]}
            showLegend={false}
          />

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-white">
                Top 5 highest demand zones at {formatHour(selectedHour)} {DAY_OPTIONS[selectedDay].label}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Same time window across all modeled zones in the lookup table.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-5">
              {topZones.map((zone, index) => (
                <div key={zone.zone_id} className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                  <div className="text-xs text-slate-500">#{index + 1}</div>
                  <div className="mt-2 text-sm font-medium text-white">{zone.zone_name}</div>
                  <div className="mt-2 text-xl font-semibold text-cyan-300">
                    {formatTrips(zone.predicted_demand)}
                  </div>
                  <div className="text-xs text-slate-400">trips/hour</div>
                </div>
              ))}
            </div>
          </section>
        </section>
      )}
    </div>
  );
}
