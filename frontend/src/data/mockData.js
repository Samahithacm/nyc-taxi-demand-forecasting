export const boroughZoneMap = {
  Manhattan: ["Upper East Side South", "Midtown Center", "Alphabet City", "Times Sq/Theatre District"],
  Queens: ["JFK Airport", "Astoria", "Long Island City", "Jamaica"],
  Brooklyn: ["Park Slope", "Williamsburg", "Brooklyn Heights", "Bushwick"],
  Bronx: ["Fordham South", "Belmont", "Mott Haven", "Riverdale"],
  "Staten Island": ["St. George", "Arden Heights", "Great Kills", "Port Richmond"],
};

export const summary = {
  currentHourDemand: 428,
  demandChangePct: 12.4,
  modelStatus: "Healthy",
  driftStatus: "No significant drift",
  mape: 18.6,
  rmse: 24.9,
  smape: 17.2,
  lastRetrain: "Apr 18, 2026 · 08:30 AM",
};

export const hourlyForecast = [
  { hour: "Now", demand: 428 },
  { hour: "+1h", demand: 451 },
  { hour: "+2h", demand: 479 },
  { hour: "+3h", demand: 462 },
  { hour: "+4h", demand: 430 },
  { hour: "+5h", demand: 401 },
];

export const recentPerformance = [
  { label: "Mon", error: 16 },
  { label: "Tue", error: 17 },
  { label: "Wed", error: 19 },
  { label: "Thu", error: 18 },
  { label: "Fri", error: 21 },
  { label: "Sat", error: 20 },
  { label: "Sun", error: 18 },
];

export const modelFunctions = [
  "1-hour ahead demand forecasting by zone",
  "Static vs adaptive model comparison",
  "Performance monitoring with MAPE, RMSE, and sMAPE",
  "Drift detection visibility for production readiness",
];

export const modelSettings = [
  { label: "Forecast Horizon", value: "1 hour ahead" },
  { label: "Monitoring Mode", value: "Weekly drift check" },
  { label: "Retraining Rule", value: "Triggered by drift/performance" },
  { label: "Serving Status", value: "Preview with mock data" },
];