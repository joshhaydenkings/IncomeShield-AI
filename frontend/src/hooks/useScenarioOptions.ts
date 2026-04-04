import { useEffect, useState } from "react";
import { getScenarioOptions, type ScenarioOption } from "../api/scenarios";

export function useScenarioOptions(deps: unknown[] = []) {
  const [options, setOptions] = useState<ScenarioOption[]>([]);
  const [currentScenario, setCurrentScenario] = useState<string>("normal");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getScenarioOptions();
        setOptions(res.availableScenarios ?? []);
        setCurrentScenario(res.currentScenario ?? "normal");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load scenarios.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, deps);

  return { options, currentScenario, loading, error };
}