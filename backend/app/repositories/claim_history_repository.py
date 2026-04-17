from datetime import datetime, timedelta, timezone
from uuid import uuid4

from ..db import db

claim_history_collection = db["claim_history"]


def _now():
    return datetime.now(timezone.utc)


def _now_iso():
    return _now().isoformat()


def _receipt_ref(prefix: str = "PAY"):
    return f"{prefix}-{uuid4().hex[:10].upper()}"


def _claim_number():
    return f"CLM-{uuid4().hex[:10].upper()}"


def find_recent_duplicate_claim(user_id: str, scenario: str, minutes: int = 5):
    cutoff = (_now() - timedelta(minutes=minutes)).isoformat()
    items = list(
        claim_history_collection.find(
            {
                "userId": user_id,
                "scenario": scenario,
                "createdAt": {"$gte": cutoff},
            }
        ).sort("createdAt", -1)
    )

    for item in items:
        lifecycle_status = item.get("lifecycleStatus")
        payout_status = item.get("claim", {}).get("payoutStatus")

        # Allow a fresh demo cycle if the recent claim is already fully paid.
        if lifecycle_status == "paid" or payout_status == "paid":
            continue

        return item

    return None


def add_claim_history(*, user_id: str, scenario: str, claim: dict, plan_info: dict):
    duplicate = find_recent_duplicate_claim(user_id, scenario)
    if duplicate:
        return duplicate, True

    now = _now_iso()
    payout_status = claim.get("payoutStatus", "none")
    payout_reference = _receipt_ref() if payout_status in {"approved", "paid"} else None
    payout_channel = "UPI Simulator" if payout_status in {"approved", "paid"} else None
    payout_timestamp = now if payout_status == "paid" else None

    stages = [
        {
            "label": "Submitted",
            "status": "done",
            "time": now,
        },
        {
            "label": "Checking",
            "status": "done" if payout_status in {"checking", "approved", "review", "paid"} else "pending",
            "time": now if payout_status in {"checking", "approved", "review", "paid"} else None,
        },
        {
            "label": "Manual Review",
            "status": "done" if payout_status == "review" else "skipped",
            "time": now if payout_status == "review" else None,
        },
        {
            "label": "Approved",
            "status": "done" if payout_status in {"approved", "paid"} else "pending",
            "time": now if payout_status in {"approved", "paid"} else None,
        },
        {
            "label": "Paid",
            "status": "done" if payout_status == "paid" else "pending",
            "time": payout_timestamp,
        },
    ]

    doc = {
        "userId": user_id,
        "scenario": scenario,
        "claim": claim,
        "planInfo": plan_info,
        "claimNumber": _claim_number(),
        "lifecycleStatus": payout_status,
        "timeline": stages,
        "duplicateBlocked": False,
        "manualTrigger": False,
        "manualReason": None,
        "payoutReference": payout_reference,
        "payoutChannel": payout_channel,
        "payoutTimestamp": payout_timestamp,
        "createdAt": now,
        "updatedAt": now,
    }
    claim_history_collection.insert_one(doc)
    return doc, False


def add_manual_claim_history(
    *,
    user_id: str,
    scenario: str,
    plan_info: dict,
    reason: str,
):
    duplicate = find_recent_duplicate_claim(user_id, scenario)
    if duplicate:
        return duplicate, True

    now = _now_iso()
    doc = {
        "userId": user_id,
        "scenario": scenario,
        "claim": {
            "issue": "Manual disruption report submitted.",
            "workerMessage": "Your manual claim request has been submitted for review.",
            "score": 50,
            "risk": "medium",
            "payoutStatus": "review",
            "payout": 0,
            "fraudFlag": False,
            "reasons": [
                "Manual claim request was submitted by the user.",
                "Claim has been routed for manual review.",
                f"User reason: {reason}",
            ],
            "aiInsight": {
                "predictedRisk": "medium",
                "predictedFraud": False,
                "inputSummary": f"Manual claim request for scenario {scenario}",
            },
        },
        "planInfo": plan_info,
        "claimNumber": _claim_number(),
        "lifecycleStatus": "review",
        "timeline": [
            {"label": "Submitted", "status": "done", "time": now},
            {"label": "Checking", "status": "done", "time": now},
            {"label": "Manual Review", "status": "done", "time": now},
            {"label": "Approved", "status": "pending", "time": None},
            {"label": "Paid", "status": "pending", "time": None},
        ],
        "duplicateBlocked": False,
        "manualTrigger": True,
        "manualReason": reason,
        "payoutReference": None,
        "payoutChannel": None,
        "payoutTimestamp": None,
        "createdAt": now,
        "updatedAt": now,
    }
    claim_history_collection.insert_one(doc)
    return doc, False


def mark_claim_as_paid(user_id: str, claim_id: str | None = None):
    items = list(
        claim_history_collection.find({"userId": user_id}).sort("createdAt", -1).limit(20)
    )

    target = None
    if claim_id:
        for item in items:
            if str(item["_id"]) == claim_id:
                target = item
                break
    else:
        for item in items:
            if item.get("lifecycleStatus") == "approved":
                target = item
                break

    if not target:
        return None, "No approved claim found for payout."

    payout_reference = _receipt_ref("UPI")
    payout_timestamp = _now_iso()

    timeline = target.get("timeline", [])
    updated_timeline = []
    paid_found = False

    for stage in timeline:
        if stage.get("label") == "Paid":
            updated_timeline.append(
                {
                    **stage,
                    "status": "done",
                    "time": payout_timestamp,
                }
            )
            paid_found = True
        else:
            updated_timeline.append(stage)

    if not paid_found:
        updated_timeline.append(
            {
                "label": "Paid",
                "status": "done",
                "time": payout_timestamp,
            }
        )

    claim = target.get("claim", {})
    claim["payoutStatus"] = "paid"
    claim["workerMessage"] = "Your payout has been sent successfully."
    claim.setdefault("aiInsight", {})

    claim_history_collection.update_one(
        {"_id": target["_id"]},
        {
            "$set": {
                "claim": claim,
                "lifecycleStatus": "paid",
                "timeline": updated_timeline,
                "payoutReference": payout_reference,
                "payoutChannel": "UPI Simulator",
                "payoutTimestamp": payout_timestamp,
                "updatedAt": _now_iso(),
            }
        },
    )

    updated = claim_history_collection.find_one({"_id": target["_id"]})
    return updated, None


def get_claim_history_for_user(user_id: str, limit: int = 10):
    items = list(
        claim_history_collection.find({"userId": user_id})
        .sort("createdAt", -1)
        .limit(limit)
    )

    result = []
    for item in items:
        claim = item.get("claim", {})
        plan_info = item.get("planInfo", {})
        result.append(
            {
                "id": str(item["_id"]),
                "claimNumber": item.get("claimNumber", ""),
                "scenario": item.get("scenario", ""),
                "issue": claim.get("issue", ""),
                "workerMessage": claim.get("workerMessage", ""),
                "payoutStatus": claim.get("payoutStatus", ""),
                "lifecycleStatus": item.get("lifecycleStatus", ""),
                "payout": claim.get("payout", 0),
                "planName": plan_info.get("name", plan_info.get("planName", "")),
                "timeline": item.get("timeline", []),
                "payoutReference": item.get("payoutReference"),
                "payoutChannel": item.get("payoutChannel"),
                "payoutTimestamp": item.get("payoutTimestamp"),
                "duplicateBlocked": item.get("duplicateBlocked", False),
                "manualTrigger": item.get("manualTrigger", False),
                "manualReason": item.get("manualReason"),
                "createdAt": item.get("createdAt"),
            }
        )

    return result