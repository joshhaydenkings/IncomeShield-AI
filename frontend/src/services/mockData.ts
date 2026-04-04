export type ScenarioKey =
  | "normal"
  | "rain"
  | "flood"
  | "aqi"
  | "outage"
  | "gps_spoof";

export const languageOptions = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "ta", label: "Tamil" },
];

export const shiftOptions = [
  "6 AM - 11 AM",
  "11 AM - 4 PM",
  "4 PM - 9 PM",
  "6 PM - 11 PM",
  "Night Shift",
];

export const workerTypeOptions = [
  "Food Delivery",
  "Grocery / Quick Commerce",
  "E-commerce Delivery",
];