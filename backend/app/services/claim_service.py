from .plan_service import get_plan_by_name
from .risk_model_service import predict_risk
from ..ml.fraud_model_service import score_fraud


def _build_fraud_features(worker: dict, scenario: str) -> dict:
    city = (worker.get("city", "") or "").strip().lower()
    zone = (worker.get("zone", "") or "").strip().lower()
    shift = worker.get("shift", "")
    worker_type = worker.get("workerType", "")

    zone_risk_score = 0.2
    if any(keyword in zone for keyword in ["tambaram", "potheri", "velachery", "thoraipakkam"]):
        zone_risk_score = 0.65
    if city in {"mumbai", "delhi"}:
        zone_risk_score = max(zone_risk_score, 0.55)

    gps_jump_score = 0.15
    signal_match_score = 0.92
    trust_score = 0.88
    claim_count_7d = 0
    device_change_count_30d = 0
    platform_inactivity_minutes = 40

    if scenario == "gps_spoof":
        gps_jump_score = 0.92
        signal_match_score = 0.25
        trust_score = 0.32
        claim_count_7d = 3
        device_change_count_30d = 2
        platform_inactivity_minutes = 6
    elif scenario == "flood":
        gps_jump_score = 0.18
        signal_match_score = 0.9
        trust_score = 0.86
        claim_count_7d = 1
        platform_inactivity_minutes = 70
    elif scenario == "rain":
        gps_jump_score = 0.2
        signal_match_score = 0.88
        trust_score = 0.84
        claim_count_7d = 1
        platform_inactivity_minutes = 55
    elif scenario == "aqi":
        gps_jump_score = 0.16
        signal_match_score = 0.9
        trust_score = 0.85
        claim_count_7d = 1
        platform_inactivity_minutes = 60
    elif scenario == "outage":
        gps_jump_score = 0.12
        signal_match_score = 0.93
        trust_score = 0.87
        claim_count_7d = 1
        platform_inactivity_minutes = 80

    if shift == "6 PM - 11 PM":
        zone_risk_score = min(1.0, zone_risk_score + 0.08)

    if worker_type == "Ride Share":
        zone_risk_score = min(1.0, zone_risk_score + 0.05)

    return {
        "claim_count_7d": claim_count_7d,
        "gps_jump_score": gps_jump_score,
        "device_change_count_30d": device_change_count_30d,
        "signal_match_score": signal_match_score,
        "trust_score": trust_score,
        "platform_inactivity_minutes": platform_inactivity_minutes,
        "zone_risk_score": zone_risk_score,
    }


def build_claim(worker: dict, scenario: str):
    plan_info = get_plan_by_name(
        worker.get("plan", "Core"),
        worker=worker,
        scenario=scenario,
    )

    risk_result = predict_risk(worker, scenario)
    risk_score = risk_result["riskScore"]
    risk_label = risk_result["riskLabel"]

    fraud_features = _build_fraud_features(worker, scenario)
    fraud_result = score_fraud(fraud_features)

    fraud_probability = float(fraud_result.get("fraud_probability", 0.0))
    fraud_decision = fraud_result.get("decision", "auto_process")
    fraud_flag = fraud_decision == "manual_review"

    scenario_defaults = {
        "normal": {
            "issue": "Conditions look normal in your area.",
            "workerMessage": "No active payout right now.",
            "payoutStatus": "none",
            "payout": 0,
        },
        "rain": {
            "issue": "Rain is slowing delivery movement in your area.",
            "workerMessage": "Rain is affecting deliveries. Your payout is being checked.",
            "payoutStatus": "checking",
            "payout": 420,
        },
        "flood": {
            "issue": "Flooded roads are blocking delivery routes in your zone.",
            "workerMessage": "Flooding is affecting your area. Your payout has been approved.",
            "payoutStatus": "approved",
            "payout": 900,
        },
        "aqi": {
            "issue": "Air quality is unsafe for extended outdoor work.",
            "workerMessage": "Air quality is affecting work. Your payout is being checked.",
            "payoutStatus": "checking",
            "payout": 520,
        },
        "outage": {
            "issue": "App outage is interrupting order flow in your area.",
            "workerMessage": "Platform outage detected. Your payout is being checked.",
            "payoutStatus": "checking",
            "payout": 450,
        },
        "gps_spoof": {
            "issue": "Location mismatch detected during the claim review.",
            "workerMessage": "Your claim needs manual review before payout.",
            "payoutStatus": "review",
            "payout": 0,
        },
    }

    selected = scenario_defaults.get(scenario, scenario_defaults["normal"])

    payout_status = selected["payoutStatus"]
    worker_message = selected["workerMessage"]
    payout_amount = selected["payout"]

    if fraud_flag:
        payout_status = "review"
        if payout_amount > 0:
            payout_amount = 0
        worker_message = "Your claim needs manual review before payout."

    reasons = [
        f"ML risk model predicted: {risk_label}.",
        f"ML risk score: {risk_score}/100.",
        f"ML fraud probability: {round(fraud_probability * 100, 1)}%.",
        f"ML fraud decision: {fraud_decision}.",
    ]

    if scenario == "normal":
        reasons.extend(
            [
                "Conditions in the active delivery zone look stable.",
                "Road movement and order flow look normal.",
                "No unusual trust or verification signals were found.",
            ]
        )
    elif scenario == "rain":
        reasons.extend(
            [
                "Rain disruption is affecting delivery completion speed.",
                "Temporary income loss trigger has been detected.",
                "Payout is being checked before release.",
            ]
        )
    elif scenario == "flood":
        reasons.extend(
            [
                "Flooding caused severe route disruption.",
                "Loss-of-income trigger threshold was crossed.",
                "Parametric event conditions support automated payout approval.",
            ]
        )
    elif scenario == "aqi":
        reasons.extend(
            [
                "AQI exceeded safe working thresholds.",
                "Outdoor work exposure risk increased sharply.",
                "Temporary support review is underway.",
            ]
        )
    elif scenario == "outage":
        reasons.extend(
            [
                "Platform availability issue disrupted normal work.",
                "Order flow dropped below expected operating levels.",
                "Automated review has started for temporary support.",
            ]
        )
    elif scenario == "gps_spoof":
        reasons.extend(
            [
                "Location and device activity signals did not align.",
                "Additional verification is needed before payout approval.",
                "Claim has been routed to manual fraud review.",
            ]
        )

    if fraud_flag:
        reasons.append("Fraud model triggered manual review override.")

    claim = {
        "issue": selected["issue"],
        "workerMessage": worker_message,
        "score": risk_score,
        "risk": risk_label,
        "payoutStatus": payout_status,
        "payout": payout_amount,
        "fraudFlag": fraud_flag,
        "reasons": reasons,
        "aiInsight": {
            "predictedRisk": risk_label,
            "predictedFraud": fraud_flag,
            "inputSummary": (
                f"{worker.get('city', '')}, "
                f"{worker.get('shift', '')}, "
                f"{worker.get('workerType', '')}, "
                f"{worker.get('plan', '')}, "
                f"{scenario}"
            ),
            "riskModelSource": risk_result.get("modelSource"),
            "riskTrainedAt": risk_result.get("trainedAt"),
            "fraudModelSource": fraud_result.get("model_source"),
            "fraudTrainedAt": fraud_result.get("trained_at"),
        },
    }

    return {
        "claim": claim,
        "planInfo": plan_info,
    }
