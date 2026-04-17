import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

export type ClaimTimelineStage = {
  label: string;
  status: string;
  time?: string | null;
};

export type ClaimHistoryItem = {
  id: string;
  claimNumber: string;
  scenario: string;
  issue: string;
  workerMessage: string;
  payoutStatus: string;
  lifecycleStatus: string;
  payout: number;
  planName: string;
  timeline: ClaimTimelineStage[];
  payoutReference?: string | null;
  payoutChannel?: string | null;
  payoutTimestamp?: string | null;
  duplicateBlocked?: boolean;
  manualTrigger?: boolean;
  manualReason?: string | null;
  createdAt?: string;
};

export function useClaimHistory(deps: unknown[] = []) {
  const [items, setItems] = useState<ClaimHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const depKey = JSON.stringify(deps);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiFetch<{ items: ClaimHistoryItem[] }>("/claims/history");
        if (!cancelled) {
          setItems(res.items ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load claim history.");
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
  }, [depKey]);

  return { items, loading, error };
}