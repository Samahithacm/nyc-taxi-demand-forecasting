import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import ModelPage from "./pages/ModelPage";
import MonitoringPage from "./pages/MonitoringPage";
import {
  getBoroughs,
  getZones,
  getDashboardData,
  getModelData,
  getMonitoringData,
} from "./services/taxiApi";

export default function App() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const [boroughs, setBoroughs] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedBorough, setSelectedBorough] = useState("");
  const [selectedZone, setSelectedZone] = useState("");

  const [dashboardData, setDashboardData] = useState(null);
  const [modelData, setModelData] = useState(null);
  const [monitoringData, setMonitoringData] = useState(null);

  const navItems = useMemo(
    () => [
      { id: "dashboard", label: "Home Dashboard" },
      { id: "model", label: "Model Section" },
      { id: "monitoring", label: "Monitoring" },
    ],
    []
  );

  useEffect(() => {
    async function loadInitialData() {
      const boroughList = await getBoroughs();
      setBoroughs(boroughList);

      if (boroughList.length > 0) {
        const firstBorough = boroughList[0];
        setSelectedBorough(firstBorough);

        const zoneList = await getZones(firstBorough);
        setZones(zoneList);

        if (zoneList.length > 0) {
          setSelectedZone(zoneList[0]);
        }
      }

      const model = await getModelData();
      const monitoring = await getMonitoringData();
      setModelData(model);
      setMonitoringData(monitoring);
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    async function loadZones() {
      if (!selectedBorough) return;
      const zoneList = await getZones(selectedBorough);
      setZones(zoneList);

      if (zoneList.length > 0 && !zoneList.includes(selectedZone)) {
        setSelectedZone(zoneList[0]);
      }
    }

    loadZones();
  }, [selectedBorough, selectedZone]);

  useEffect(() => {
    async function loadDashboardData() {
      if (!selectedBorough || !selectedZone) return;
      const data = await getDashboardData(selectedBorough, selectedZone);
      setDashboardData(data);
    }

    loadDashboardData();
  }, [selectedBorough, selectedZone]);

  const summary = dashboardData?.summary;
  const hourlyForecast = dashboardData?.hourlyForecast || [];
  const recentPerformance = monitoringData?.recentPerformance || [];
  const modelFunctions = modelData?.modelFunctions || [];
  const modelSettings = modelData?.modelSettings || [];

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
          zones={zones}
          selectedZone={selectedZone}
          onZoneChange={setSelectedZone}
        />

        <main className="px-6 py-8 lg:px-8">
          {activeSection === "dashboard" && summary && (
            <DashboardPage
              selectedBorough={selectedBorough}
              selectedZone={selectedZone}
              summary={summary}
              hourlyForecast={hourlyForecast}
            />
          )}

          {activeSection === "model" && (
            <ModelPage
              modelFunctions={modelFunctions}
              modelSettings={modelSettings}
            />
          )}

          {activeSection === "monitoring" && summary && (
            <MonitoringPage
              summary={summary}
              recentPerformance={recentPerformance}
            />
          )}
        </main>
      </div>
    </div>
  );
}