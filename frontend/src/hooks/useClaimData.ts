import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

type ClaimData = {
  claim: {
    issue: string;
    workerMessage: string;
    score: number;
    risk: string;
    payoutStatus: string;
    payout: number;
    fraudFlag: boolean;
    reasons: string[];
    aiInsight?: {
      predictedRisk?: string;
      predictedFraud?: boolean;
      inputSummary?: string;
      modelSource?: string;
      trainedAt?: string;
      riskModelSource?: string;
      riskTrainedAt?: string;
      fraudModelSource?: string;
      fraudTrainedAt?: string;
    };
  };
  planInfo: {
    name: string;
    premium: number;
    protection: number;
    badge: string;
    pricingMode?: string;
    pricingReasons?: string[];
    basePremium?: number;
  };
  currentScenario?: string;
};

export function useClaimData(deps: unknown[] = []) {
  const [data, setData] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const depKey = JSON.stringify(deps);
  const scenario = typeof deps[0] === "string" ? deps[0] : "";

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const path = scenario
          ? `/claims/current?scenario=${encodeURIComponent(scenario)}`
          : "/claims/current";
        const res = await apiFetch<ClaimData>(path);
        if (!cancelled) {
          setData(res);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load claim data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [depKey, scenario]);

  return { data, loading, error };
}