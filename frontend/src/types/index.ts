export type Language = "en" | "hi" | "ta";

export type WorkerType =
  | "Food Delivery"
  | "Grocery / Quick Commerce"
  | "E-commerce Delivery";

export type Plan = "Lite" | "Core" | "Shield+";

export interface WorkerProfile {
  name: string;
  city: string;
  zone: string;
  shift: string;
  workerType: WorkerType;
  language: Language;
  plan: Plan;
}

export interface PlanInfo {
  name: Plan;
  premium: number;
  protection: number;
  badge: string;
}