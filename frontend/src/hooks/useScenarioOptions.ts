import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import type { ScenarioKey } from "../services/mockData";

type ScenarioOption = {
  key: ScenarioKey;
  label: string;
};

export function useScenarioOptions(deps: unknown[] = []) {
  const [options, setOptions] = useState<ScenarioOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiFetch<{
          availableScenarios?: ScenarioOption[];
        }>("/scenarios");
        setOptions(res.availableScenarios ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load scenarios.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, deps);

  return { options, loading, error };
}