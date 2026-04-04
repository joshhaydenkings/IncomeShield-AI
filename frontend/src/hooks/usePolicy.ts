import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

export type PolicyInfo = {
  id: string;
  policyNumber: string;
  status: string;
  planName: string;
  weeklyPremium: number;
  basePremium: number;
  protection: number;
  badge: string;
  pricingMode: string;
  pricingReasons: string[];
  effectiveDate?: string;
  renewalDate?: string;
};

export function usePolicy(deps: unknown[] = []) {
  const [policy, setPolicy] = useState<PolicyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiFetch<{ policy: PolicyInfo }>("/policy/current");
        setPolicy(res.policy);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load policy.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, deps);

  return { policy, loading, error };
}