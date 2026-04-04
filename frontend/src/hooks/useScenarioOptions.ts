import { useEffect, useState } from "react";
import { getScenarios } from "../api/scenarios";
import type { ScenarioKey } from "../services/mockData";

export function useScenarioOptions() {
  const [options, setOptions] = useState<{ key: ScenarioKey; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getScenarios();
        setOptions(res.availableScenarios);
      } catch {
        setError("Failed to load scenarios.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { options, loading, error };
}