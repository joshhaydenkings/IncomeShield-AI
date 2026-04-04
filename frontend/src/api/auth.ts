const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://127.0.0.1:8000";

type User = {
  id: string;
  name: string;
  email: string;
  city: string;
  zone: string;
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
    throw new Error(typeof data === "string" ? data : JSON.stringify(data));
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