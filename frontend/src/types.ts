export type Language = "en" | "hi" | "ta";
export type Plan = "Lite" | "Core" | "Shield+";

export type WorkerProfile = {
  name: string;
  city: string;
  zone: string;
  shift: string;
  workerType: string;
  language: Language;
  plan: Plan;
};

export type PlanInfo = {
  name: Plan;
  premium: number;
  basePremium: number;
  protection: number;
  badge: string;
  pricingReasons: string[];
  pricingMode?: "ml" | "ml-hybrid" | "rules";
};