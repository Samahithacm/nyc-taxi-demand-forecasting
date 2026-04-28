import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import ErrorState from "./components/ui/ErrorState";
import LoadingState from "./components/ui/LoadingState";
import DashboardPage from "./pages/DashboardPage";
import ModelPage from "./pages/ModelPage";
import MonitoringPage from "./pages/MonitoringPage";
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
      { id: "dashboard", label: "Dashboard" },
      { id: "model", label: "Model" },
      { id: "monitoring", label: "Monitoring" },
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

  useEffect(() => {
    if (!zonesForSelectedBorough.length) return;
    if (!zonesForSelectedBorough.some((zone) => zone.id === Number(selectedZone))) {
      setSelectedZone(zonesForSelectedBorough[0].id);
    }
  }, [zonesForSelectedBorough, selectedZone]);

  const selectedZoneObject = useMemo(
    () => data?.zones?.zones?.find((zone) => zone.id === Number(selectedZone)) || null,
    [data, selectedZone]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[280px_1fr]">
        <Sidebar
          navItems={navItems}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          boroughs={boroughs}
          selectedBorough={selectedBorough}
          onBoroughChange={setSelectedBorough}
          zones={zonesForSelectedBorough}
          selectedZone={selectedZone}
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

          {!loading && !error && data && activeSection === "model" && <ModelPage data={data} />}

          {!loading && !error && data && activeSection === "monitoring" && (
            <MonitoringPage data={data} />
          )}
        </main>
      </div>
    </div>
  );
}
