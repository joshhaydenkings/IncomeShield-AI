import type { Plan, WorkerProfile } from "../types";
import type { ScenarioKey } from "./mockData";

import { getApiBaseUrl } from "../utils/apiBase";

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

export async function getScenarios() {
  return apiFetch<{
    currentScenario: ScenarioKey;
    scenarios: Record<string, unknown>;
    availableScenarios: { key: ScenarioKey; label: string }[];
  }>("/scenarios");
}

export async function updateCurrentScenario(scenario: ScenarioKey) {
  return apiFetch<{
    message: string;
    currentScenario: ScenarioKey;
    scenarioData: unknown;
    availableScenarios: { key: ScenarioKey; label: string }[];
  }>("/scenarios/current", {
    method: "PUT",
    body: JSON.stringify({ scenario }),
  });
}

export async function getPlans() {
  return apiFetch<{
    plans: {
      name: Plan;
      premium: number;
      protection: number;
      badge: string;
    }[];
  }>("/plans");
}

export async function updateWorkerPlan(plan: Plan) {
  return apiFetch<{
    message: string;
    worker: WorkerProfile;
    planInfo: {
      name: Plan;
      premium: number;
      protection: number;
      badge: string;
    };
  }>("/worker/plan", {
    method: "PUT",
    body: JSON.stringify({ plan }),
  });
}

export async function getCurrentClaim() {
  return apiFetch<{
    worker: WorkerProfile;
    scenario: ScenarioKey;
    claim: {
      score: number;
      issue: string;
      payout: number;
      payoutStatus: "none" | "checking" | "approved" | "review";
      risk: "low" | "medium" | "high";
      fraudFlag: boolean;
      reasons: string[];
      workerMessage: string;
    };
    planInfo: {
      name: Plan;
      premium: number;
      protection: number;
      badge: string;
    };
  }>("/claims/current");
}

export async function getAdminReview() {
  return apiFetch<{
    worker: WorkerProfile;
    scenario: ScenarioKey;
    fraudStatus: string;
    reviewType: string;
    payoutRoute: string;
    claimStatusLabel: string;
    reviewerRecommendation: string;
    gpsStatus: string;
    trustScore: string;
    deviceStatus: string;
    clusterRisk: string;
    payoutStatus: "none" | "checking" | "approved" | "review";
    payout: number;
    reasons: string[];
  }>("/admin/review");
}

export async function resetBackendState() {
  return apiFetch<{ message: string }>("/reset", {
    method: "POST",
  });
}
