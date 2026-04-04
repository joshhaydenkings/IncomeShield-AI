import { apiFetch } from "./client";

export async function submitManualClaim(reason: string) {
  return apiFetch<{
    message: string;
    duplicateBlocked: boolean;
    claimNumber?: string;
  }>("/claims/manual", {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}