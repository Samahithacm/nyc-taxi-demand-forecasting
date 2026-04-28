import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import ErrorState from "./components/ui/ErrorState";
import LoadingState from "./components/ui/LoadingState";
import DashboardPage from "./pages/DashboardPage";
import ForecastExplorerPage from "./pages/ForecastExplorerPage";
import LivePredictionPage from "./pages/LivePredictionPage";
import ModelPage from "./pages/ModelPage";
import MonitoringPage from "./pages/MonitoringPage";
import ZoneAnalysisPage from "./pages/ZoneAnalysisPage";
import {
  getDriftMetrics,
  getPredictions,
  getRetrainEvents,
  getSummary,
  getTimePeriodAnalysis,
  getWeeklyComparison,
  getZonePerformance,
  getZones,
} from "./services/taxiApi";

function getModeledBoroughs(zonesData) {
  const modeled = new Set(zonesData?.zones?.map((zone) => zone.borough) || []);
  return (zonesData?.boroughs || []).filter((borough) => modeled.has(borough));
}

function getZonesForBorough(zonesData, borough) {
  return (zonesData?.zones || [])
    .filter((zone) => zone.borough === borough)
    .sort((a, b) => a.rank - b.rank);
}

export default function App() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [data, setData] = useState(null);
  const [selectedBorough, setSelectedBorough] = useState("");
  const [selectedZone, setSelectedZone] = useState(null);

  const navItems = useMemo(
    () => [
      { id: "dashboard", label: "Dashboard", icon: "Home" },
      { id: "predict", label: "Live Prediction", icon: "Sparkles" },
      { id: "explorer", label: "Forecast Explorer", icon: "TrendingUp" },
      { id: "zones", label: "Zone Analysis", icon: "Map" },
      { id: "model", label: "Model Details", icon: "Cpu" },
      { id: "monitoring", label: "Monitoring", icon: "Activity" },
    ],
    []
  );

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [
          summary,
          zones,
          predictions,
          driftMetrics,
          retrainEvents,
          weeklyComparison,
          zonePerformance,
          timePeriodAnalysis,
        ] = await Promise.all([
          getSummary(),
          getZones(),
          getPredictions(),
          getDriftMetrics(),
          getRetrainEvents(),
          getWeeklyComparison(),
          getZonePerformance(),
          getTimePeriodAnalysis(),
        ]);

        const nextData = {
          summary,
          zones,
          predictions,
          driftMetrics,
          retrainEvents,
          weeklyComparison,
          zonePerformance,
          timePeriodAnalysis,
        };
        setData(nextData);

        const boroughs = getModeledBoroughs(zones);
        const initialBorough = boroughs[0] || "";
        const initialZones = getZonesForBorough(zones, initialBorough);
        const initialZone = initialZones[0]?.id || null;
        setSelectedBorough(initialBorough);
        setSelectedZone(initialZone);
      } catch (loadError) {
        setError(loadError.message || "Unable to load frontend data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [retryKey]);

  const boroughs = useMemo(() => getModeledBoroughs(data?.zones), [data]);

  const zonesForSelectedBorough = useMemo(
    () => getZonesForBorough(data?.zones, selectedBorough),
    [data, selectedBorough]
  );

  const effectiveSelectedZone = useMemo(
    () =>
      zonesForSelectedBorough.some((zone) => zone.id === Number(selectedZone))
        ? Number(selectedZone)
        : zonesForSelectedBorough[0]?.id || null,
    [selectedZone, zonesForSelectedBorough]
  );

  const selectedZoneObject = useMemo(
    () => data?.zones?.zones?.find((zone) => zone.id === Number(effectiveSelectedZone)) || null,
    [data, effectiveSelectedZone]
  );

  function handleSidebarBoroughChange(nextBorough) {
    setSelectedBorough(nextBorough);
    const nextZones = getZonesForBorough(data?.zones, nextBorough);
    setSelectedZone(nextZones[0]?.id || null);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[280px_1fr]">
        <Sidebar
          navItems={navItems}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          boroughs={boroughs}
          selectedBorough={selectedBorough}
          onBoroughChange={handleSidebarBoroughChange}
          zones={zonesForSelectedBorough}
          selectedZone={effectiveSelectedZone}
          onZoneChange={(zoneId) => setSelectedZone(Number(zoneId))}
          summary={data?.summary}
        />

        <main className="px-6 py-8 lg:px-8">
          {loading && <LoadingState message="Loading exported model data..." />}

          {!loading && error && (
            <ErrorState message={error} onRetry={() => setRetryKey((value) => value + 1)} />
          )}

          {!loading && !error && data && activeSection === "dashboard" && selectedZoneObject && (
            <DashboardPage
              data={data}
              selectedBorough={selectedBorough}
              selectedZone={selectedZoneObject}
            />
          )}

          {!loading && !error && data && activeSection === "predict" && (
            <LivePredictionPage zones={data.zones.zones} boroughs={boroughs} />
          )}

          {!loading && !error && data && activeSection === "explorer" && (
            <ForecastExplorerPage
              zones={data.zones.zones}
              boroughs={boroughs}
              predictionsData={data.predictions}
            />
          )}

          {!loading && !error && data && activeSection === "zones" && (
            <ZoneAnalysisPage
              zones={data.zones.zones}
              zonePerformance={data.zonePerformance}
            />
          )}

          {!loading && !error && data && activeSection === "model" && <ModelPage data={data} />}

          {!loading && !error && data && activeSection === "monitoring" && (
            <MonitoringPage data={data} />
          )}
        </main>
      </div>
    </div>
  );
}
