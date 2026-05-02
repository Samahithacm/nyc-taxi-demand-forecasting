const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const DATA_BASE = "/data";
let authToken = null;

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

export function getAuthToken() {
  if (authToken) return authToken;
  if (typeof localStorage === "undefined") return null;
  authToken = localStorage.getItem("taxi_api_token");
  return authToken;
}

export function setAuthToken(token) {
  authToken = token;
  if (typeof localStorage === "undefined") return;
  if (token) {
    localStorage.setItem("taxi_api_token", token);
  } else {
    localStorage.removeItem("taxi_api_token");
  }
}

export async function loginToAPI(username = "demo", password = "demo123") {
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);

  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`API login failed: ${response.status}`);
  }

  const data = await response.json();
  setAuthToken(data.access_token);
  return data;
}

export async function checkAPIHealth() {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    if (!response.ok) {
      throw new Error(`API health failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("API health check failed:", error);
    return { status: "unreachable", model_loaded: false };
  }
}

function getLocalPrediction(predictionLookup, zoneId, hour, dayOfWeek) {
  const prediction = predictionLookup.predictions[`${zoneId}_${hour}_${dayOfWeek}`];
  if (!prediction) {
    throw new Error("No local cached prediction found for this scenario.");
  }

  return {
    ...prediction,
    model_version: predictionLookup.metadata?.model_version || "local_lookup",
    timestamp: new Date().toISOString(),
  };
}

export async function predictFromAPI(zoneId, hour, dayOfWeek) {
  const token = getAuthToken();

  try {
    if (token) {
      const response = await fetch(`${API_BASE}/api/predict`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zone_id: Number(zoneId),
          hour: Number(hour),
          day_of_week: Number(dayOfWeek),
        }),
      });

      if (response.ok) {
        return await response.json();
      }

      if (response.status !== 401) {
        throw new Error(`Authenticated prediction failed: ${response.status}`);
      }
      setAuthToken(null);
    }

    const publicUrl = new URL(`${API_BASE}/api/predict/public`);
    publicUrl.searchParams.set("zone_id", zoneId);
    publicUrl.searchParams.set("hour", hour);
    publicUrl.searchParams.set("day_of_week", dayOfWeek);
    const publicResponse = await fetch(publicUrl);

    if (!publicResponse.ok) {
      throw new Error(`Public prediction failed: ${publicResponse.status}`);
    }

    return await publicResponse.json();
  } catch (error) {
    console.warn("API prediction failed; using local lookup fallback:", error);
    const predictionLookup = await getPredictionLookup();
    return getLocalPrediction(predictionLookup, zoneId, hour, dayOfWeek);
  }
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
