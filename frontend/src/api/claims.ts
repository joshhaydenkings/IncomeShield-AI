export type ReleasePayoutResponse = {
  message: string;
  claimId: string;
  payoutReference?: string;
  payoutChannel?: string;
  payoutTimestamp?: string;
  lifecycleStatus: string;
};

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

export async function releasePayout(claimId?: string) {
  return apiFetch<ReleasePayoutResponse>("/claims/release-payout", {
    method: "POST",
    body: JSON.stringify({
      claimId: claimId ?? null,
    }),
  });
}