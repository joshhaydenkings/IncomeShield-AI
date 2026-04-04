type Language = "en" | "hi" | "ta";

export type TranslationKey =
  | "dashboard"
  | "plans"
  | "alerts"
  | "claims"
  | "city"
  | "language"
  | "weeklyPlan"
  | "hearThis"
  | "weeklyProtectionPlans"
  | "currentPlan"
  | "youPay"
  | "perWeek"
  | "protectedUpTo"
  | "maximumProtection"
  | "currentPlanButton"
  | "switchToThisPlan"
  | "viewClaimStatus"
  | "stormMode"
  | "earnabilityIndex"
  | "canYouEarnNow"
  | "currentCondition"
  | "riskLevel"
  | "viewPlans"
  | "liveScore"
  | "payoutStatus"
  | "needsReview"
  | "normal"
  | "zone"
  | "shift"
  | "fraudCheck";

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    dashboard: "Dashboard",
    plans: "Plans",
    alerts: "Alerts",
    claims: "Claims",
    city: "City",
    language: "Language",
    weeklyPlan: "Weekly plan",
    hearThis: "Hear this",
    weeklyProtectionPlans: "Weekly protection plans",
    currentPlan: "Current plan",
    youPay: "You pay",
    perWeek: "per week",
    protectedUpTo: "Protected up to",
    maximumProtection: "Maximum protection",
    currentPlanButton: "Current plan",
    switchToThisPlan: "Switch to this plan",
    viewClaimStatus: "View claim status",
    stormMode: "Storm mode",
    earnabilityIndex: "Earnability Index",
    canYouEarnNow: "Can you earn now?",
    currentCondition: "Current condition",
    riskLevel: "Risk level",
    viewPlans: "View plans",
    liveScore: "Live score",
    payoutStatus: "Payout status",
    needsReview: "Needs review",
    normal: "Normal",
    zone: "Zone",
    shift: "Shift",
    fraudCheck: "Fraud check",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    plans: "प्लान",
    alerts: "अलर्ट",
    claims: "क्लेम",
    city: "शहर",
    language: "भाषा",
    weeklyPlan: "साप्ताहिक प्लान",
    hearThis: "सुनें",
    weeklyProtectionPlans: "साप्ताहिक सुरक्षा प्लान",
    currentPlan: "वर्तमान प्लान",
    youPay: "आप भुगतान करते हैं",
    perWeek: "प्रति सप्ताह",
    protectedUpTo: "सुरक्षा सीमा",
    maximumProtection: "अधिकतम सुरक्षा",
    currentPlanButton: "वर्तमान प्लान",
    switchToThisPlan: "इस प्लान पर जाएँ",
    viewClaimStatus: "क्लेम स्थिति देखें",
    stormMode: "तूफ़ान मोड",
    earnabilityIndex: "कमाई सूचकांक",
    canYouEarnNow: "क्या आप अभी कमा सकते हैं?",
    currentCondition: "वर्तमान स्थिति",
    riskLevel: "जोखिम स्तर",
    viewPlans: "प्लान देखें",
    liveScore: "लाइव स्कोर",
    payoutStatus: "भुगतान स्थिति",
    needsReview: "समीक्षा आवश्यक",
    normal: "सामान्य",
    zone: "ज़ोन",
    shift: "शिफ्ट",
    fraudCheck: "धोखाधड़ी जाँच",
  },
  ta: {
    dashboard: "டாஷ்போர்டு",
    plans: "திட்டங்கள்",
    alerts: "எச்சரிக்கைகள்",
    claims: "கோரிக்கைகள்",
    city: "நகர்",
    language: "மொழி",
    weeklyPlan: "வார திட்டம்",
    hearThis: "கேளுங்கள்",
    weeklyProtectionPlans: "வார பாதுகாப்பு திட்டங்கள்",
    currentPlan: "தற்போதைய திட்டம்",
    youPay: "நீங்கள் செலுத்துவது",
    perWeek: "ஒரு வாரத்திற்கு",
    protectedUpTo: "பாதுகாப்பு வரம்பு",
    maximumProtection: "அதிகபட்ச பாதுகாப்பு",
    currentPlanButton: "தற்போதைய திட்டம்",
    switchToThisPlan: "இந்த திட்டத்தைத் தேர்வுசெய்",
    viewClaimStatus: "கோரிக்கை நிலையை பார்க்க",
    stormMode: "புயல் நிலை",
    earnabilityIndex: "வருமான குறியீடு",
    canYouEarnNow: "நீங்கள் இப்போது சம்பாதிக்க முடியுமா?",
    currentCondition: "தற்போதைய நிலை",
    riskLevel: "அபாய நிலை",
    viewPlans: "திட்டங்களை காண்க",
    liveScore: "நேரடி மதிப்பெண்",
    payoutStatus: "பணம் நிலை",
    needsReview: "மதிப்பாய்வு தேவை",
    normal: "சாதாரணம்",
    zone: "மண்டலம்",
    shift: "பணி நேரம்",
    fraudCheck: "மோசடி சரிபார்ப்பு",
  },
};

export function tr(language: Language, key: TranslationKey): string {
  return translations[language]?.[key] ?? translations.en[key] ?? key;
}

export function getEarnabilityLabel(score: number): string {
  if (score >= 80) return "Good";
  if (score >= 50) return "Medium";
  return "Very Low";
}

export function getPayoutStatusText(
  language: Language,
  status: "none" | "checking" | "approved" | "review",
): string {
  const map: Record<Language, Record<typeof status, string>> = {
    en: {
      none: "No active payout right now.",
      checking: "Your payout is being checked.",
      approved: "Your payout has been approved.",
      review: "Your payout needs manual review.",
    },
    hi: {
      none: "अभी कोई सक्रिय भुगतान नहीं है।",
      checking: "आपके भुगतान की जाँच हो रही है।",
      approved: "आपका भुगतान स्वीकृत हो गया है।",
      review: "आपके भुगतान को मैनुअल समीक्षा चाहिए।",
    },
    ta: {
      none: "இப்போது செயலில் இருக்கும் கட்டணம் இல்லை.",
      checking: "உங்கள் கட்டணம் சரிபார்க்கப்படுகிறது.",
      approved: "உங்கள் கட்டணம் ஒப்புதல் பெற்றது.",
      review: "உங்கள் கட்டணத்திற்கு கைமுறை பரிசீலனை தேவை.",
    },
  };

  return map[language][status];
}