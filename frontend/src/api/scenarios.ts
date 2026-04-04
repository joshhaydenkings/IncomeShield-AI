import { apiFetch } from "./client";
import type { ScenarioKey } from "../services/mockData";

export async function getScenarios() {
  return apiFetch<{
    currentScenario?: ScenarioKey;
    scenario?: ScenarioKey;
    availableScenarios?: ScenarioKey[];
  }>("/scenarios");
}

export async function updateScenario(scenario: ScenarioKey) {
  return apiFetch<{
    currentScenario?: ScenarioKey;
    scenario?: ScenarioKey;
    availableScenarios?: ScenarioKey[];
  }>("/scenarios/current", {
    method: "PUT",
    body: JSON.stringify({ scenario }),
  });
}