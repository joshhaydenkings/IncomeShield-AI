import { apiFetch } from "./client";

export async function syncLiveScenario() {
  return apiFetch<{
    message: string;
    currentScenario: string;
    reason: string;
    queryUsed: string;
    location: {
      name: string;
      latitude: number;
      longitude: number;
      country?: string;
      admin1?: string;
    };
    liveData: {
      temperature?: number;
      precipitation?: number;
      rain?: number;
      showers?: number;
      weatherCode?: number;
      windSpeed?: number;
      aqi?: number;
      pm25?: number;
    };
  }>("/scenarios/live", {
    method: "POST",
  });
}