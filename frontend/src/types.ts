export type Language = "en" | "hi" | "ta";
export type Plan = "Lite" | "Core" | "Shield+";

export type WorkerProfile = {
  name: string;
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
