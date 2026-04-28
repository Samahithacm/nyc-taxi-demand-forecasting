const DATA_BASE = "/data";

async function fetchJSON(filename) {
  try {
    const response = await fetch(`${DATA_BASE}/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filename}: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    throw error;
  }
}

export async function getSummary() {
  return fetchJSON("summary.json");
}

export async function getZones() {
  return fetchJSON("zones.json");
}

export async function getPredictions() {
  return fetchJSON("predictions.json");
}

export async function getDriftMetrics() {
  return fetchJSON("drift_metrics.json");
}

export async function getRetrainEvents() {
  return fetchJSON("retrain_events.json");
}

export async function getWeeklyComparison() {
  return fetchJSON("weekly_comparison.json");
}

export async function getZonePerformance() {
  return fetchJSON("zone_performance.json");
}

export async function getTimePeriodAnalysis() {
  return fetchJSON("time_period_analysis.json");
}

export async function getPredictionLookup() {
  return fetchJSON("prediction_lookup.json");
}

export async function getAllFrontendData() {
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

  return {
    summary,
    zones,
    predictions,
    driftMetrics,
    retrainEvents,
    weeklyComparison,
    zonePerformance,
    timePeriodAnalysis,
  };
}

// Backward compatibility - DO NOT REMOVE until all pages updated.
export async function getBoroughs() {
  const data = await getZones();
  return data.boroughs;
}

// Backward compatibility - DO NOT REMOVE until all pages updated.
export async function getDashboardData(borough, zoneNameOrId) {
  const [summary, zonesData, predictionsData, weeklyComparison, zonePerformance] =
    await Promise.all([
      getSummary(),
      getZones(),
      getPredictions(),
      getWeeklyComparison(),
      getZonePerformance(),
    ]);

  const selectedZone =
    zonesData.zones.find((zone) => String(zone.id) === String(zoneNameOrId)) ||
    zonesData.zones.find((zone) => zone.name === zoneNameOrId) ||
    zonesData.zones.find((zone) => zone.borough === borough) ||
    zonesData.zones[0];

  return {
    borough,
    zone: selectedZone,
    summary,
    weeklyComparison,
    zonePerformance,
    predictions: predictionsData.zones[String(selectedZone.id)]?.predictions || [],
  };
}

// Backward compatibility - DO NOT REMOVE until all pages updated.
export async function getModelData() {
  const [summary, weeklyComparison, zonePerformance, timePeriodAnalysis] = await Promise.all([
    getSummary(),
    getWeeklyComparison(),
    getZonePerformance(),
    getTimePeriodAnalysis(),
  ]);

  return { summary, weeklyComparison, zonePerformance, timePeriodAnalysis };
}

// Backward compatibility - DO NOT REMOVE until all pages updated.
export async function getMonitoringData() {
  const [summary, weeklyComparison, driftMetrics, retrainEvents] = await Promise.all([
    getSummary(),
    getWeeklyComparison(),
    getDriftMetrics(),
    getRetrainEvents(),
  ]);

  return { summary, weeklyComparison, driftMetrics, retrainEvents };
}
