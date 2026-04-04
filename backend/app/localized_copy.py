from .schemas import Language, ScenarioKey

scenario_copy: dict[Language, dict[ScenarioKey, dict[str, str]]] = {
    "en": {
        "normal": {
            "issue": "Conditions are stable. Deliveries are active in your area.",
            "workerMessage": "Everything looks normal. No payout action is needed right now.",
        },
        "rain": {
            "issue": "Heavy rain is slowing deliveries in your area.",
            "workerMessage": "Heavy rain is affecting your area. We are checking your payout.",
        },
        "flood": {
            "issue": "Flooded roads are blocking delivery routes in your zone.",
            "workerMessage": "Flooding is affecting your area. Your payout has been approved.",
        },
        "aqi": {
            "issue": "Air quality is unsafe for long outdoor work right now.",
            "workerMessage": "Air quality is unsafe. We are checking your payout.",
        },
        "outage": {
            "issue": "Platform outage is reducing order assignments sharply.",
            "workerMessage": "Platform outage detected. Your payout has been approved.",
        },
        "gps_spoof": {
            "issue": "Location mismatch detected. We need to review this case.",
            "workerMessage": "We found unusual activity. This case needs review.",
        },
    },
    "hi": {
        "normal": {
            "issue": "स्थिति सामान्य है। आपके क्षेत्र में डिलीवरी चालू है।",
            "workerMessage": "सब सामान्य दिख रहा है। अभी किसी भुगतान कार्रवाई की ज़रूरत नहीं है।",
        },
        "rain": {
            "issue": "भारी बारिश आपके क्षेत्र में डिलीवरी धीमी कर रही है।",
            "workerMessage": "भारी बारिश आपके क्षेत्र को प्रभावित कर रही है। हम आपका भुगतान जाँच रहे हैं।",
        },
        "flood": {
            "issue": "जलभराव से आपके क्षेत्र में डिलीवरी रूट बंद हो रहे हैं।",
            "workerMessage": "बाढ़ जैसी स्थिति आपके क्षेत्र को प्रभावित कर रही है। आपका भुगतान स्वीकृत हो गया है।",
        },
        "aqi": {
            "issue": "हवा की गुणवत्ता अभी लंबे समय तक बाहर काम करने के लिए असुरक्षित है।",
            "workerMessage": "हवा की गुणवत्ता असुरक्षित है। हम आपका भुगतान जाँच रहे हैं।",
        },
        "outage": {
            "issue": "प्लेटफ़ॉर्म समस्या के कारण ऑर्डर बहुत कम हो रहे हैं।",
            "workerMessage": "प्लेटफ़ॉर्म समस्या मिली। आपका भुगतान स्वीकृत हो गया है।",
        },
        "gps_spoof": {
            "issue": "लोकेशन मेल नहीं खा रही। इस केस की समीक्षा चाहिए।",
            "workerMessage": "हमें असामान्य गतिविधि मिली। इस केस की समीक्षा ज़रूरी है।",
        },
    },
    "ta": {
        "normal": {
            "issue": "நிலைமை சாதாரணமாக உள்ளது. உங்கள் பகுதியில் டெலிவரி நடைபெறுகிறது.",
            "workerMessage": "எல்லாமும் சாதாரணமாக உள்ளது. இப்போது பணம் வழங்கும் நடவடிக்கை தேவையில்லை.",
        },
        "rain": {
            "issue": "கனமழை உங்கள் பகுதியில் டெலிவரியை மந்தமாக்குகிறது.",
            "workerMessage": "கனமழை உங்கள் பகுதியை பாதிக்கிறது. உங்கள் தொகையை நாங்கள் சரிபார்க்கிறோம்.",
        },
        "flood": {
            "issue": "நீர்ப்பெருக்கு காரணமாக உங்கள் பகுதியில் டெலிவரி பாதைகள் முடங்கியுள்ளன.",
            "workerMessage": "நீர்ப்பெருக்கு உங்கள் பகுதியை பாதிக்கிறது. உங்கள் தொகை ஒப்புதல் பெற்றது.",
        },
        "aqi": {
            "issue": "காற்றின் தரம் தற்போது வெளியே நீண்ட நேரம் வேலை செய்ய பாதுகாப்பற்றது.",
            "workerMessage": "காற்றின் தரம் பாதுகாப்பற்றது. உங்கள் தொகையை நாங்கள் சரிபார்க்கிறோம்.",
        },
        "outage": {
            "issue": "பிளாட்ஃபார்ம் கோளாறால் ஆர்டர்கள் கடுமையாக குறைந்துள்ளன.",
            "workerMessage": "பிளாட்ஃபார்ம் கோளாறு கண்டறியப்பட்டது. உங்கள் தொகை ஒப்புதல் பெற்றது.",
        },
        "gps_spoof": {
            "issue": "இருப்பிடத் தகவல் பொருந்தவில்லை. இந்த வழக்கை மதிப்பாய்வு செய்ய வேண்டும்.",
            "workerMessage": "சந்தேகமான செயல்பாடு கண்டறியப்பட்டது. இந்த வழக்குக்கு மதிப்பாய்வு தேவை.",
        },
    },
}

scenario_labels: dict[Language, dict[ScenarioKey, str]] = {
    "en": {
        "normal": "Normal",
        "rain": "Heavy Rain",
        "flood": "Flood",
        "aqi": "Unsafe AQI",
        "outage": "App Outage",
        "gps_spoof": "Suspicious GPS",
    },
    "hi": {
        "normal": "सामान्य",
        "rain": "भारी बारिश",
        "flood": "बाढ़",
        "aqi": "असुरक्षित AQI",
        "outage": "ऐप आउटेज",
        "gps_spoof": "संदिग्ध GPS",
    },
    "ta": {
        "normal": "சாதாரணம்",
        "rain": "கனமழை",
        "flood": "நீர்ப்பெருக்கு",
        "aqi": "பாதுகாப்பற்ற AQI",
        "outage": "ஆப் தடை",
        "gps_spoof": "சந்தேகமான GPS",
    },
}


def get_localized_scenario_copy(language: str, scenario: str) -> dict[str, str]:
    safe_language: Language = language if language in scenario_copy else "en"
    safe_scenario: ScenarioKey = scenario if scenario in scenario_copy["en"] else "normal"
    return scenario_copy[safe_language][safe_scenario]


def get_localized_scenario_labels(language: str) -> list[dict[str, str]]:
    safe_language: Language = language if language in scenario_labels else "en"
    ordered_keys: list[ScenarioKey] = ["normal", "rain", "flood", "aqi", "outage", "gps_spoof"]

    return [
        {"key": key, "label": scenario_labels[safe_language][key]}
        for key in ordered_keys
    ]