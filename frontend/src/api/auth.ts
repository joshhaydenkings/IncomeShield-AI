import { getApiBaseUrl } from "../utils/apiBase";

const API_BASE_URL = getApiBaseUrl();

type User = {
  id: string;
  name: string;
  email: string;
  city: string;
  zone: string;
  pincode?: string;
  normalized_location?: string;
  resolved_name?: string;
  resolved_admin1?: string;
  resolved_country?: string;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string;
  shift: string;
  workerType: string;
  language: string;
  plan: string;
  profileCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
};

async function apiFetch<T>(path: string, options?: RequestInit, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
    ...options,
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

export async function signup(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return apiFetch<{ message: string; token: string; user: User }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: {
  email: string;
  password: string;
}) {
  return apiFetch<{ message: string; token: string; user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMe(token: string) {
  return apiFetch<{ user: User }>("/auth/me", { method: "GET" }, token);
}

export async function updateProfile(
  token: string,
  payload: {
    city: string;
    zone: string;
    pincode?: string;
    shift: string;
    workerType: string;
    language: string;
    plan: string;
  }
) {
  return apiFetch<{ message: string; user: User }>(
    "/auth/profile",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    token
  );
}
