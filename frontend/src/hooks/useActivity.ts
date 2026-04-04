import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

export type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
};

export function useActivity(deps: unknown[] = []) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiFetch<{ items: ActivityItem[] }>("/activity");
        setItems(res.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load activity.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, deps);

  return { items, loading, error };
}