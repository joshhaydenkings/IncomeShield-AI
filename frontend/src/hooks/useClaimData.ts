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
    };
  };
  planInfo: {
    name: string;
    premium: number;
    protection: number;
    badge: string;
  };
};

export function useClaimData(deps: unknown[] = []) {
  const [data, setData] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiFetch<ClaimData>("/claims/current");
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load claim data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, deps);

  return { data, loading, error };
}