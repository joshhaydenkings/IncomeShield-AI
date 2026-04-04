AVAILABLE_SCENARIOS = [
    {"key": "normal", "label": "Normal"},
    {"key": "rain", "label": "Heavy Rain"},
    {"key": "flood", "label": "Flood"},
    {"key": "aqi", "label": "Unsafe AQI"},
    {"key": "outage", "label": "App Outage"},
    {"key": "gps_spoof", "label": "Suspicious GPS"},
]


SCENARIO_DATA = {
    "normal": {
        "issue": "Conditions look normal in your area.",
        "workerMessage": "No active payout right now.",
        "score": 86,
        "risk": "low",
        "payoutStatus": "none",
        "payoutRatio": 0.0,
        "fraudFlag": False,
        "reasons": [
            "Conditions in the active delivery zone look stable.",
            "Road movement and order flow look normal.",
            "No unusual trust or verification signals were found.",
        ],
    },
    "rain": {
        "issue": "Heavy rain is slowing deliveries in your area.",
        "workerMessage": "Rain is affecting deliveries. Your payout is being checked.",
        "score": 52,
        "risk": "medium",
        "payoutStatus": "checking",
        "payoutRatio": 0.18,
        "fraudFlag": False,
        "reasons": [
            "Heavy rain was detected in the active delivery zone.",
            "Movement and order completion may slow during this shift.",
            "The case is being checked against plan coverage.",
        ],
    },
    "flood": {
        "issue": "Flooded roads are blocking delivery routes in your zone.",
        "workerMessage": "Flooding is affecting your area. Your payout has been approved.",
        "score": 18,
        "risk": "high",
        "payoutStatus": "approved",
        "payoutRatio": 0.42,
        "fraudFlag": False,
        "reasons": [
            "Flood conditions were verified in the active delivery zone.",
            "Road movement is heavily restricted and earning ability is very low.",
            "The worker's activity pattern looks normal and trusted.",
        ],
    },
    "aqi": {
        "issue": "Air quality is unsafe for extended outdoor work.",
        "workerMessage": "Air quality is affecting outdoor work. Your payout is being checked.",
        "score": 33,
        "risk": "high",
        "payoutStatus": "checking",
        "payoutRatio": 0.14,
        "fraudFlag": False,
        "reasons": [
            "Unsafe AQI levels were detected in the active work area.",
            "Long outdoor exposure is discouraged during this period.",
            "Plan coverage is being checked before payout is finalized.",
        ],
    },
    "outage": {
        "issue": "The platform is experiencing an outage in your area.",
        "workerMessage": "App outage detected. Your payout is being checked.",
        "score": 41,
        "risk": "medium",
        "payoutStatus": "checking",
        "payoutRatio": 0.12,
        "fraudFlag": False,
        "reasons": [
            "A service outage was detected on the delivery platform.",
            "Order flow is interrupted and shift earnings may be reduced.",
            "The case is being checked against active plan rules.",
        ],
    },
    "gps_spoof": {
        "issue": "Location signals do not match expected activity.",
        "workerMessage": "Your case is under review due to a location mismatch.",
        "score": 24,
        "risk": "high",
        "payoutStatus": "review",
        "payoutRatio": 0.0,
        "fraudFlag": True,
        "reasons": [
            "GPS and network location signals are not aligned.",
            "The case requires a manual review before payout can continue.",
            "Additional trust checks are being applied.",
        ],
    },
}


def get_available_scenarios():
    return AVAILABLE_SCENARIOS


def get_scenario_data(scenario_key: str):
    return SCENARIO_DATA.get(scenario_key, SCENARIO_DATA["normal"])