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

  const depKey = JSON.stringify(deps);
  const scenario = typeof deps[0] === "string" ? deps[0] : "";

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const path = scenario
          ? `/admin/review?scenario=${encodeURIComponent(scenario)}`
          : "/admin/review";

        const res = await apiFetch<AdminReview>(path);

        if (!cancelled) {
          setData(res);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load admin review.");
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