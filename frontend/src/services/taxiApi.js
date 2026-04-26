import {
  boroughZoneMap,
  summary,
  hourlyForecast,
  recentPerformance,
  modelFunctions,
  modelSettings,
} from "../data/mockData";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getBoroughs() {
  await delay(150);
  return Object.keys(boroughZoneMap);
}

export async function getZones(borough) {
  await delay(150);
  return boroughZoneMap[borough] || [];
}

export async function getDashboardData(borough, zone) {
  await delay(150);
  return {
    borough,
    zone,
    summary,
    hourlyForecast,
  };
}

export async function getModelData() {
  await delay(150);
  return {
    modelFunctions,
    modelSettings,
  };
}

export async function getMonitoringData() {
  await delay(150);
  return {
    summary,
    recentPerformance,
  };
}