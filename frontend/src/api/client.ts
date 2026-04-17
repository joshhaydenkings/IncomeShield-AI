import { getToken } from "../utils/auth";
import { getApiBaseUrl } from "../utils/apiBase";

const API_BASE_URL = getApiBaseUrl();

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });

  const text = await response.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    if (typeof data === "string") {
      throw new Error(data || `Request failed: ${response.status}`);
    }

    if (data && typeof data === "object" && "detail" in data) {
      const detail = (data as { detail?: unknown }).detail;
      if (typeof detail === "string" && detail.trim()) {
        throw new Error(detail);
      }
    }

    throw new Error(`Request failed: ${response.status}`);
  }

  return data as T;
}
