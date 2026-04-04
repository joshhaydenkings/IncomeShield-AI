import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

type AdminReview = {
  worker: {
    name: string;
    city: string;
    zone: string;
  };
  reviewType: string;
  fraudStatus: string;
  gpsStatus: string;
  deviceStatus: string;
  trustScore: string;
  clusterRisk: string;
  payoutStatus: string;
  claimStatusLabel: string;
  payoutRoute: string;
  reviewerRecommendation: string;
  reasons: string[];
};

export function useAdminReview(deps: unknown[] = []) {
  const [data, setData] = useState<AdminReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiFetch<AdminReview>("/admin/review");
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin review.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, deps);

  return { data, loading, error };
}