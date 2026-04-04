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
  createdAt?: string;
};

export function useClaimHistory(deps: unknown[] = []) {
  const [items, setItems] = useState<ClaimHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiFetch<{ items: ClaimHistoryItem[] }>("/claims/history");
        setItems(res.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load claim history.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, deps);

  return { items, loading, error };
}