import { apiFetch } from "./client";
import type { WorkerProfile } from "../types";
import type { ScenarioKey } from "../services/mockData";

export async function getAdminReview() {
  return apiFetch<{
    worker: WorkerProfile;
    scenario: ScenarioKey;
    fraudStatus: string;
    reviewType: string;
    payoutRoute: string;
    claimStatusLabel: string;
    reviewerRecommendation: string;
    gpsStatus: string;
    trustScore: string;
    deviceStatus: string;
    clusterRisk: string;
    payoutStatus: "none" | "checking" | "approved" | "review";
    payout: number;
    reasons: string[];
  }>("/admin/review");
}