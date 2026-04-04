import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import type { PlanInfo } from "../types";

export function usePlans(deps: unknown[] = []) {
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentScenario, setCurrentScenario] = useState<string>("normal");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiFetch<{
          plans: PlanInfo[];
          currentScenario?: string;
        }>("/plans");
        setPlans(res.plans || []);
        setCurrentScenario(res.currentScenario || "normal");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load plans.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, deps);

  return { plans, loading, error, currentScenario };
}