from fastapi import APIRouter, Depends, Query

from ..deps import get_current_user
from ..repositories.user_state_repository import get_current_scenario_for_user
from ..services.claim_service import build_claim

router = APIRouter(prefix="/admin", tags=["Admin"])


def _scenario_review_label(scenario: str) -> str:
    labels = {
        "normal": "Normal conditions review",
        "rain": "Heavy rain review",
        "flood": "Flood disruption review",
        "aqi": "Air quality review",
        "outage": "Platform outage review",
        "gps_spoof": "GPS mismatch review",
    }
    return labels.get(scenario, f"{scenario.replace('_', ' ').title()} review")


@router.get("/review")
def get_admin_review(
    current_user: dict = Depends(get_current_user),
    scenario: str | None = Query(default=None),
):
    user_id = str(current_user["_id"])
    active_scenario = scenario or get_current_scenario_for_user(user_id)

    claim_data = build_claim(current_user, active_scenario)
    claim = claim_data["claim"]
    ai_insight = claim.get("aiInsight", {}) or {}
    fraud_signals = ai_insight.get("fraudSignals", {}) or {}

    fraud_probability = float(ai_insight.get("fraudProbability", 0.0) or 0.0)
    fraud_flag = bool(claim.get("fraudFlag", False))
    payout_status = claim.get("payoutStatus", "none")

    gps_jump_score = float(fraud_signals.get("gps_jump_score", 0.0) or 0.0)
    device_change_count = int(fraud_signals.get("device_change_count_30d", 0) or 0)
    trust_score_raw = float(fraud_signals.get("trust_score", 0.0) or 0.0)
    claim_count_7d = int(fraud_signals.get("claim_count_7d", 0) or 0)

    gps_status = "Mismatch" if gps_jump_score >= 0.75 else "Match"
    device_status = "Unusual" if device_change_count >= 2 else "Normal"
    trust_score = f"{int(round(trust_score_raw * 100))} / 100"
    cluster_risk = "Possible ring pattern" if claim_count_7d >= 3 else "No ring pattern"

    if payout_status in {"approved", "paid"} and not fraud_flag:
        payout_route = "Instant payout"
        claim_status_label = "Eligible"
        reviewer_recommendation = "Approve payout"
    elif payout_status == "checking":
        payout_route = "Automatic check"
        claim_status_label = "Checking"
        reviewer_recommendation = "Monitor case"
    elif payout_status == "review" or fraud_flag:
        payout_route = "Manual review"
        claim_status_label = "Needs review"
        reviewer_recommendation = "Hold payout"
    else:
        payout_route = "No payout"
        claim_status_label = "No active claim"
        reviewer_recommendation = "No action needed"

    fraud_status = "Elevated" if fraud_flag or fraud_probability >= 0.65 else "Normal"

    return {
        "worker": {
            "name": current_user.get("name", ""),
            "city": current_user.get("city", ""),
            "zone": current_user.get("zone", ""),
        },
        "reviewType": _scenario_review_label(active_scenario),
        "fraudStatus": fraud_status,
        "gpsStatus": gps_status,
        "deviceStatus": device_status,
        "trustScore": trust_score,
        "clusterRisk": cluster_risk,
        "payoutStatus": payout_status,
        "claimStatusLabel": claim_status_label,
        "payoutRoute": payout_route,
        "reviewerRecommendation": reviewer_recommendation,
        "reasons": claim.get("reasons", []),
    }