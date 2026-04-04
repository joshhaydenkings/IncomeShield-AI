import { apiFetch } from "./client";

export async function resetBackendState() {
  return apiFetch<{ message: string }>("/reset", {
    method: "POST",
  });
}