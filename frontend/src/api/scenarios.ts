import { apiFetch } from "./client";
import type { ScenarioKey } from "../services/mockData";

export type ScenarioOption = {
  key: ScenarioKey;
  label: string;
};

export async function getScenarioOptions() {
  return apiFetch<{
    currentScenario: ScenarioKey;
    availableScenarios: ScenarioOption[];
  }>("/scenarios");
}

export async function updateScenario(nextScenario: ScenarioKey) {
  return apiFetch<{
    scenario: ScenarioKey;
    currentScenario?: ScenarioKey;
    availableScenarios?: ScenarioOption[];
    message?: string;
  }>("/scenarios/current", {
    method: "PUT",
    body: JSON.stringify({
      scenario: nextScenario,
    }),
  });
}

export async function useLiveScenario() {
  return apiFetch<{
    scenario: ScenarioKey;
    currentScenario?: ScenarioKey;
    availableScenarios?: ScenarioOption[];
    message?: string;
  }>("/scenarios/sync-live", {
    method: "POST",
  });
}
