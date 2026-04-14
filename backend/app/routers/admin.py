from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/review")
def get_admin_review():
    return {
        "reviewType": "Flood disruption review",
        "fraudStatus": "Normal",
        "payoutRoute": "Instant payout",
        "payoutStatus": "approved",
        "gpsStatus": "Match",
        "deviceStatus": "Normal",
        "trustScore": "84 / 100",
        "clusterRisk": "No ring pattern",
        "claimStatusLabel": "Eligible",
        "reviewerRecommendation": "Approve payout",
        "reasons": [
            "Location signals match the worker delivery zone.",
            "No suspicious device changes were detected.",
            "Disruption timing aligns with verified external events."
        ]
    }