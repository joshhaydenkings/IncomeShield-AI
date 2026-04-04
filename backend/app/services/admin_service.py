from .claim_service import build_claim


def build_admin_review(worker: dict, scenario_key: str):
    claim_data = build_claim(worker, scenario_key)
    claim = claim_data["claim"]

    if scenario_key == "gps_spoof":
        gps_status = "Mismatch"
        device_status = "Unusual"
        trust_score = "42 / 100"
        cluster_risk = "Possible ring pattern"
        payout_route = "Manual review"
        reviewer_recommendation = "Review required"
        review_type = "Location mismatch"
    else:
        gps_status = "Aligned"
        device_status = "Consistent"
        trust_score = "89 / 100"
        cluster_risk = "No cluster risk"
        payout_route = "Instant payout" if claim["payoutStatus"] == "approved" else "Standard review"
        reviewer_recommendation = "Safe for fast support" if not claim["fraudFlag"] else "Review required"
        review_type = "Verified disruption"

    fraud_status = "Elevated" if claim["fraudFlag"] else "Normal"

    return {
        "worker": worker,
        "scenario": scenario_key,
        "reviewType": review_type,
        "fraudStatus": fraud_status,
        "gpsStatus": gps_status,
        "deviceStatus": device_status,
        "trustScore": trust_score,
        "clusterRisk": cluster_risk,
        "payoutStatus": claim["payoutStatus"],
        "claimStatusLabel": claim["payoutStatus"].capitalize(),
        "payoutRoute": payout_route,
        "reviewerRecommendation": reviewer_recommendation,
        "reasons": claim["reasons"],
    }