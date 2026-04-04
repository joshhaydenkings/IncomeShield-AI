import { apiFetch } from "./client";
import type { Plan } from "../types";

export async function getPlans() {
  return apiFetch<{
    plans: {
      name: Plan;
      premium: number;
      protection: number;
      badge: string;
    }[];
  }>("/plans");
}