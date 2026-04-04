import type { Language } from "../types";
import type { ScenarioKey } from "./mockData";

const ui: Record<Language, Record<string, string>> = {
  en: {
    hearThis: "Hear this",
    canYouEarnNow: "Can You Earn Now?",
    earnabilityIndex: "Earnability Index",
    liveScore: "Live score",
    weeklyPlan: "Weekly plan",
    youPay: "You pay",
    protectedUpTo: "Protected up to",
    payoutStatus: "Payout status",
    workerProfile: "Worker profile",
    city: "City",
    zone: "Zone",
    shift: "Shift",
    workerType: "Worker type",
    language: "Language",
    fraudCheck: "Fraud check",
    normal: "Normal",
    needsReview: "Needs review",
    approved: "Approved",
    checking: "Checking",
    underReview: "Under Review",
    noActionNeeded: "No action needed",
    good: "Good",
    low: "Low",
    veryLow: "Very Low",
    currentWorker: "Current worker",
    currentAlert: "Current alert",
    currentCondition: "Current condition",
    riskLevel: "Risk level",
    workerMessage: "Worker-facing message",
    triggerMonitor: "Trigger monitor",
    stormMode: "Storm Mode",
    viewClaimStatus: "View claim status",
    claimAndPayoutStatus: "Claim and payout status",
    payoutDecision: "Payout decision",
    estimatedPayout: "Estimated payout",
    whyDecision: "Why this decision was made",
    simpleExplanation: "We keep the explanation simple so workers can understand what happened.",
    dashboard: "Dashboard",
    plans: "Plans",
    alerts: "Alerts",
    claims: "Claims",
    admin: "Admin",
    weeklyProtectionPlans: "Weekly protection plans",
    currentPlan: "Current plan",
    worker: "Worker",
    perWeek: "per week",
    maximumProtection: "Maximum protection",
    bestFor: "Best for",
    switchToThisPlan: "Switch to this plan",
    currentPlanButton: "Current plan",
    backToDashboard: "Back to dashboard",
    whyWeeklyPricingWorks: "Why weekly pricing works",
    weeklyPricingLine1: "Gig workers earn week to week, so pricing should follow the same rhythm.",
    weeklyPricingLine2: "Lower-friction pricing makes it easier to understand and adopt.",
    weeklyPricingLine3: "Plans can later adapt dynamically using risk and disruption history.",
    viewPlans: "View plans",
  },
  hi: {
    hearThis: "सुनें",
    canYouEarnNow: "क्या आप अभी कमा सकते हैं?",
    earnabilityIndex: "कमाई सूचकांक",
    liveScore: "लाइव स्कोर",
    weeklyPlan: "आपकी साप्ताहिक योजना",
    youPay: "आपका भुगतान",
    protectedUpTo: "अधिकतम सुरक्षा",
    payoutStatus: "भुगतान स्थिति",
    workerProfile: "वर्कर प्रोफ़ाइल",
    city: "शहर",
    zone: "क्षेत्र",
    shift: "शिफ्ट",
    workerType: "वर्कर प्रकार",
    language: "भाषा",
    fraudCheck: "फ्रॉड जाँच",
    normal: "सामान्य",
    needsReview: "समीक्षा आवश्यक",
    approved: "स्वीकृत",
    checking: "जाँच चल रही है",
    underReview: "समीक्षा में",
    noActionNeeded: "कोई कार्रवाई नहीं",
    good: "अच्छा",
    low: "कम",
    veryLow: "बहुत कम",
    currentWorker: "मौजूदा वर्कर",
    currentAlert: "मौजूदा अलर्ट",
    currentCondition: "मौजूदा स्थिति",
    riskLevel: "जोखिम स्तर",
    workerMessage: "वर्कर संदेश",
    triggerMonitor: "ट्रिगर मॉनिटर",
    stormMode: "स्टॉर्म मोड",
    viewClaimStatus: "क्लेम स्थिति देखें",
    claimAndPayoutStatus: "क्लेम और भुगतान स्थिति",
    payoutDecision: "भुगतान निर्णय",
    estimatedPayout: "अनुमानित भुगतान",
    whyDecision: "यह निर्णय क्यों लिया गया",
    simpleExplanation: "हम इसे सरल रखते हैं ताकि वर्कर आसानी से समझ सके कि क्या हुआ।",
    dashboard: "डैशबोर्ड",
    plans: "योजनाएँ",
    alerts: "अलर्ट",
    claims: "क्लेम",
    admin: "एडमिन",
    weeklyProtectionPlans: "साप्ताहिक सुरक्षा योजनाएँ",
    currentPlan: "मौजूदा योजना",
    worker: "वर्कर",
    perWeek: "प्रति सप्ताह",
    maximumProtection: "अधिकतम सुरक्षा",
    bestFor: "सबसे अच्छा",
    switchToThisPlan: "इस योजना पर जाएँ",
    currentPlanButton: "मौजूदा योजना",
    backToDashboard: "डैशबोर्ड पर वापस",
    whyWeeklyPricingWorks: "साप्ताहिक कीमत क्यों सही है",
    weeklyPricingLine1: "गिग वर्कर सप्ताह के हिसाब से कमाते हैं, इसलिए कीमत भी वैसी होनी चाहिए।",
    weeklyPricingLine2: "सरल साप्ताहिक भुगतान समझने और अपनाने में आसान होता है।",
    weeklyPricingLine3: "बाद में योजनाएँ जोखिम और व्यवधान इतिहास के आधार पर बदल सकती हैं।",
    viewPlans: "योजनाएँ देखें",
  },
  ta: {
    hearThis: "கேளுங்கள்",
    canYouEarnNow: "இப்போது நீங்கள் சம்பாதிக்க முடியுமா?",
    earnabilityIndex: "சம்பாதிப்பு குறியீடு",
    liveScore: "நேரடி மதிப்பெண்",
    weeklyPlan: "உங்கள் வார திட்டம்",
    youPay: "நீங்கள் செலுத்துவது",
    protectedUpTo: "அதிகபட்ச பாதுகாப்பு",
    payoutStatus: "பணம் நிலை",
    workerProfile: "பணியாளர் விவரம்",
    city: "நகரம்",
    zone: "பகுதி",
    shift: "வேலை நேரம்",
    workerType: "பணியாளர் வகை",
    language: "மொழி",
    fraudCheck: "மோசடி சோதனை",
    normal: "சாதாரணம்",
    needsReview: "மதிப்பாய்வு தேவை",
    approved: "ஒப்புதல்",
    checking: "சரிபார்க்கப்படுகிறது",
    underReview: "மதிப்பாய்வில் உள்ளது",
    noActionNeeded: "செயல் தேவையில்லை",
    good: "நன்று",
    low: "குறைவு",
    veryLow: "மிகக் குறைவு",
    currentWorker: "தற்போதைய பணியாளர்",
    currentAlert: "தற்போதைய எச்சரிக்கை",
    currentCondition: "தற்போதைய நிலை",
    riskLevel: "ஆபத்து நிலை",
    workerMessage: "பணியாளர் செய்தி",
    triggerMonitor: "டிரிகர் கண்காணிப்பு",
    stormMode: "புயல் நிலை",
    viewClaimStatus: "கோரிக்கை நிலை பார்க்க",
    claimAndPayoutStatus: "கோரிக்கை மற்றும் பண நிலை",
    payoutDecision: "பணம் வழங்கும் முடிவு",
    estimatedPayout: "மதிப்பிடப்பட்ட தொகை",
    whyDecision: "இந்த முடிவு ஏன் எடுக்கப்பட்டது",
    simpleExplanation: "என்ன நடந்தது என்பதை பணியாளர் எளிதாகப் புரிந்து கொள்ள இதை நாங்கள் எளிமையாக காட்டுகிறோம்.",
    dashboard: "டாஷ்போர்டு",
    plans: "திட்டங்கள்",
    alerts: "எச்சரிக்கைகள்",
    claims: "கோரிக்கைகள்",
    admin: "நிர்வாகம்",
    weeklyProtectionPlans: "வாராந்திர பாதுகாப்பு திட்டங்கள்",
    currentPlan: "தற்போதைய திட்டம்",
    worker: "பணியாளர்",
    perWeek: "ஒரு வாரத்திற்கு",
    maximumProtection: "அதிகபட்ச பாதுகாப்பு",
    bestFor: "இதற்கு சிறந்தது",
    switchToThisPlan: "இந்த திட்டத்திற்கு மாறுங்கள்",
    currentPlanButton: "தற்போதைய திட்டம்",
    backToDashboard: "டாஷ்போர்டுக்கு திரும்பு",
    whyWeeklyPricingWorks: "வாராந்திர விலை ஏன் பொருத்தமாகும்",
    weeklyPricingLine1: "கிக் பணியாளர்கள் வார வாரமாக சம்பாதிக்கிறார்கள், அதனால் விலையும் அப்படியே இருக்க வேண்டும்.",
    weeklyPricingLine2: "எளிய வாராந்திர கட்டணம் புரிந்துகொள்ளவும் பயன்படுத்தவும் சுலபம்.",
    weeklyPricingLine3: "பிறகு ஆபத்து மற்றும் இடையூறு வரலாற்றின் அடிப்படையில் திட்டங்கள் மாறலாம்.",
    viewPlans: "திட்டங்களை பார்க்க",
  },
};

const scenarioCopy: Record<
  Language,
  Record<ScenarioKey, { issue: string; workerMessage: string }>
> = {
  en: {
    normal: {
      issue: "Conditions are stable. Deliveries are active in your area.",
      workerMessage: "Everything looks normal. No payout action is needed right now.",
    },
    rain: {
      issue: "Heavy rain is slowing deliveries in your area.",
      workerMessage: "Heavy rain is affecting your area. We are checking your payout.",
    },
    flood: {
      issue: "Flooded roads are blocking delivery routes in your zone.",
      workerMessage: "Flooding is affecting your area. Your payout has been approved.",
    },
    aqi: {
      issue: "Air quality is unsafe for long outdoor work right now.",
      workerMessage: "Air quality is unsafe. We are checking your payout.",
    },
    outage: {
      issue: "Platform outage is reducing order assignments sharply.",
      workerMessage: "Platform outage detected. Your payout has been approved.",
    },
    gps_spoof: {
      issue: "Location mismatch detected. We need to review this case.",
      workerMessage: "We found unusual activity. This case needs review.",
    },
  },
  hi: {
    normal: {
      issue: "स्थिति सामान्य है। आपके क्षेत्र में डिलीवरी चालू है।",
      workerMessage: "सब सामान्य दिख रहा है। अभी किसी भुगतान कार्रवाई की ज़रूरत नहीं है।",
    },
    rain: {
      issue: "भारी बारिश आपके क्षेत्र में डिलीवरी धीमी कर रही है।",
      workerMessage: "भारी बारिश आपके क्षेत्र को प्रभावित कर रही है। हम आपका भुगतान जाँच रहे हैं।",
    },
    flood: {
      issue: "जलभराव से आपके क्षेत्र में डिलीवरी रूट बंद हो रहे हैं।",
      workerMessage: "बाढ़ जैसी स्थिति आपके क्षेत्र को प्रभावित कर रही है। आपका भुगतान स्वीकृत हो गया है।",
    },
    aqi: {
      issue: "हवा की गुणवत्ता अभी लंबे समय तक बाहर काम करने के लिए असुरक्षित है।",
      workerMessage: "हवा की गुणवत्ता असुरक्षित है। हम आपका भुगतान जाँच रहे हैं।",
    },
    outage: {
      issue: "प्लेटफ़ॉर्म समस्या के कारण ऑर्डर बहुत कम हो रहे हैं।",
      workerMessage: "प्लेटफ़ॉर्म समस्या मिली। आपका भुगतान स्वीकृत हो गया है।",
    },
    gps_spoof: {
      issue: "लोकेशन मेल नहीं खा रही। इस केस की समीक्षा चाहिए।",
      workerMessage: "हमें असामान्य गतिविधि मिली। इस केस की समीक्षा ज़रूरी है।",
    },
  },
  ta: {
    normal: {
      issue: "நிலைமை சாதாரணமாக உள்ளது. உங்கள் பகுதியில் டெலிவரி நடைபெறுகிறது.",
      workerMessage: "எல்லாமும் சாதாரணமாக உள்ளது. இப்போது பணம் வழங்கும் நடவடிக்கை தேவையில்லை.",
    },
    rain: {
      issue: "கனமழை உங்கள் பகுதியில் டெலிவரியை மந்தமாக்குகிறது.",
      workerMessage: "கனமழை உங்கள் பகுதியை பாதிக்கிறது. உங்கள் தொகையை நாங்கள் சரிபார்க்கிறோம்.",
    },
    flood: {
      issue: "நீர்ப்பெருக்கு காரணமாக உங்கள் பகுதியில் டெலிவரி பாதைகள் முடங்கியுள்ளன.",
      workerMessage: "நீர்ப்பெருக்கு உங்கள் பகுதியை பாதிக்கிறது. உங்கள் தொகை ஒப்புதல் பெற்றது.",
    },
    aqi: {
      issue: "காற்றின் தரம் தற்போது வெளியே நீண்ட நேரம் வேலை செய்ய பாதுகாப்பற்றது.",
      workerMessage: "காற்றின் தரம் பாதுகாப்பற்றது. உங்கள் தொகையை நாங்கள் சரிபார்க்கிறோம்.",
    },
    outage: {
      issue: "பிளாட்ஃபார்ம் கோளாறால் ஆர்டர்கள் கடுமையாக குறைந்துள்ளன.",
      workerMessage: "பிளாட்ஃபார்ம் கோளாறு கண்டறியப்பட்டது. உங்கள் தொகை ஒப்புதல் பெற்றது.",
    },
    gps_spoof: {
      issue: "இருப்பிடத் தகவல் பொருந்தவில்லை. இந்த வழக்கை மதிப்பாய்வு செய்ய வேண்டும்.",
      workerMessage: "சந்தேகமான செயல்பாடு கண்டறியப்பட்டது. இந்த வழக்குக்கு மதிப்பாய்வு தேவை.",
    },
  },
};

export function tr(language: Language, key: string) {
  return ui[language]?.[key] ?? ui.en[key] ?? key;
}

export function getScenarioCopy(language: Language, scenario: ScenarioKey) {
  return scenarioCopy[language][scenario];
}

export function getEarnabilityLabel(language: Language, score: number) {
  if (score >= 70) return tr(language, "good");
  if (score >= 35) return tr(language, "low");
  return tr(language, "veryLow");
}

export function getPayoutStatusText(
  language: Language,
  status: "none" | "checking" | "approved" | "review"
) {
  if (status === "approved") return tr(language, "approved");
  if (status === "checking") return tr(language, "checking");
  if (status === "review") return tr(language, "underReview");
  return tr(language, "noActionNeeded");
}