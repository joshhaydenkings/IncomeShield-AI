import { getApiBaseUrl } from "../utils/apiBase";

export type WorkerProfile = {
  name: string;
  city: string;
  zone: string;
  shift: string;
  workerType: string;
  language: string;
  plan: string;
};

const API_BASE_URL = getApiBaseUrl();

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json();
}

export async function getCurrentWorker() {
  return apiFetch<{ worker: WorkerProfile }>("/worker/current");
}

export async function onboardWorker(worker: WorkerProfile) {
  return apiFetch<{ message: string; worker: WorkerProfile }>("/worker/onboard", {
    method: "POST",
    body: JSON.stringify(worker),
  });
}

export async function updateWorkerPlan(plan: string) {
  return apiFetch<{
    message: string;
    worker: WorkerProfile;
    planInfo: {
      name: string;
      premium: number;
      protection: number;
      badge: string;
    };
  }>("/worker/plan", {
    method: "PUT",
    body: JSON.stringify({ plan }),
  });
}
