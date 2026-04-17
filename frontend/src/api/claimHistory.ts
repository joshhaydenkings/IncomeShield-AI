import { getApiBaseUrl } from "../utils/apiBase";

const API_BASE_URL = getApiBaseUrl();

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json();
}

export type ClaimHistoryItem = {
  id: string;
  scenario: string;
  issue: string;
  workerMessage: string;
  score: number;
  risk: string;
  payoutStatus: string;
  payout: number;
  fraudFlag: boolean;
  planName: string;
  createdAt: string;
};

export async function getClaimHistory() {
  return apiFetch<{ items: ClaimHistoryItem[] }>("/claims/history");
}
