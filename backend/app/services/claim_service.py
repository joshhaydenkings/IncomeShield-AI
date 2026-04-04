from .plan_service import get_plan_by_name


def build_claim(worker: dict, scenario: str):
    plan_info = get_plan_by_name(worker.get("plan", "Core"), worker=worker, scenario=scenario)

    scenario_map = {
        "normal": {
            "issue": "Conditions look normal in your area.",
            "workerMessage": "No active payout right now.",
            "score": 92,
            "risk": "low",
            "payoutStatus": "none",
            "payout": 0,
            "fraudFlag": False,
            "reasons": [
                "ML risk model predicted: low.",
                "ML fraud review flag: No.",
                "Conditions in the active delivery zone look stable.",
                "Road movement and order flow look normal.",
                "No unusual trust or verification signals were found.",
            ],
        },
        "rain": {
            "issue": "Rain is slowing delivery movement in your area.",
            "workerMessage": "Rain is affecting deliveries. Your payout is being checked.",
            "score": 48,
            "risk": "medium",
            "payoutStatus": "checking",
            "payout": 420,
            "fraudFlag": False,
            "reasons": [
                "ML risk model predicted: medium.",
                "ML fraud review flag: No.",
                "Rain disruption is affecting delivery completion speed.",
                "Temporary income loss trigger has been detected.",
                "Payout is being checked before release.",
            ],
        },
        "flood": {
            "issue": "Flooded roads are blocking delivery routes in your zone.",
            "workerMessage": "Flooding is affecting your area. Your payout has been approved.",
            "score": 10,
            "risk": "high",
            "payoutStatus": "approved",
            "payout": 900,
            "fraudFlag": False,
            "reasons": [
                "ML risk model predicted: high.",
                "ML fraud review flag: No.",
                "Flooding caused severe route disruption.",
                "Loss-of-income trigger threshold was crossed.",
                "Parametric event conditions support automated payout approval.",
            ],
        },
        "aqi": {
            "issue": "Air quality is unsafe for extended outdoor work.",
            "workerMessage": "Air quality is affecting work. Your payout is being checked.",
            "score": 28,
            "risk": "high",
            "payoutStatus": "checking",
            "payout": 520,
            "fraudFlag": False,
            "reasons": [
                "ML risk model predicted: high.",
                "ML fraud review flag: No.",
                "AQI exceeded safe working thresholds.",
                "Outdoor work exposure risk increased sharply.",
                "Temporary support review is underway.",
            ],
        },
        "outage": {
            "issue": "App outage is interrupting order flow in your area.",
            "workerMessage": "Platform outage detected. Your payout is being checked.",
            "score": 41,
            "risk": "medium",
            "payoutStatus": "checking",
            "payout": 450,
            "fraudFlag": False,
            "reasons": [
                "ML risk model predicted: medium.",
                "ML fraud review flag: No.",
                "Platform availability issue disrupted normal work.",
                "Order flow dropped below expected operating levels.",
                "Automated review has started for temporary support.",
            ],
        },
        "gps_spoof": {
            "issue": "Location mismatch detected during the claim review.",
            "workerMessage": "Your claim needs manual review before payout.",
            "score": 35,
            "risk": "high",
            "payoutStatus": "review",
            "payout": 0,
            "fraudFlag": True,
            "reasons": [
                "ML risk model predicted: high.",
                "ML fraud review flag: Yes.",
                "Location and device activity signals did not align.",
                "Additional verification is needed before payout approval.",
                "Claim has been routed to manual fraud review.",
            ],
        },
    }

    selected = scenario_map.get(scenario, scenario_map["normal"])

    claim = {
        "issue": selected["issue"],
        "workerMessage": selected["workerMessage"],
        "score": selected["score"],
        "risk": selected["risk"],
        "payoutStatus": selected["payoutStatus"],
        "payout": selected["payout"],
        "fraudFlag": selected["fraudFlag"],
        "reasons": selected["reasons"],
        "aiInsight": {
            "predictedRisk": selected["risk"],
            "predictedFraud": selected["fraudFlag"],
            "inputSummary": f"{worker.get('city', '')}, {worker.get('shift', '')}, {worker.get('workerType', '')}, {worker.get('plan', '')}, {scenario}",
        },
    }

    return {
        "claim": claim,
        "planInfo": plan_info,
    }