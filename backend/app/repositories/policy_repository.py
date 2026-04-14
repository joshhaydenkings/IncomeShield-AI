from datetime import datetime, timedelta, timezone
from uuid import uuid4

from ..db import db

policy_collection = db["policies"]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _renewal_iso(days: int = 7) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()


def _policy_number() -> str:
    return f"POL-{uuid4().hex[:10].upper()}"


def get_policy_for_user(user_id: str):
    return policy_collection.find_one({"userId": user_id, "status": "active"})


def create_or_update_policy_for_user(user_id: str, plan_info: dict):
    existing = get_policy_for_user(user_id)

    if existing:
        policy_collection.update_one(
            {"_id": existing["_id"]},
            {
                "$set": {
                    "planName": plan_info["name"],
                    "weeklyPremium": plan_info["premium"],
                    "basePremium": plan_info.get("basePremium", plan_info["premium"]),
                    "protection": plan_info["protection"],
                    "badge": plan_info.get("badge", ""),
                    "pricingMode": plan_info.get("pricingMode", "rules"),
                    "pricingReasons": plan_info.get("pricingReasons", []),
                    "updatedAt": _now_iso(),
                }
            },
        )
        return get_policy_for_user(user_id)

    now = _now_iso()
    doc = {
        "userId": user_id,
        "policyNumber": _policy_number(),
        "status": "active",
        "planName": plan_info["name"],
        "weeklyPremium": plan_info["premium"],
        "basePremium": plan_info.get("basePremium", plan_info["premium"]),
        "protection": plan_info["protection"],
        "badge": plan_info.get("badge", ""),
        "pricingMode": plan_info.get("pricingMode", "rules"),
        "pricingReasons": plan_info.get("pricingReasons", []),
        "effectiveDate": now,
        "renewalDate": _renewal_iso(7),
        "createdAt": now,
        "updatedAt": now,
    }
    policy_collection.insert_one(doc)
    return get_policy_for_user(user_id)


def serialize_policy(policy: dict | None):
    if not policy:
        return None

    return {
        "id": str(policy["_id"]),
        "policyNumber": policy.get("policyNumber", ""),
        "status": policy.get("status", "active"),
        "planName": policy.get("planName", ""),
        "weeklyPremium": policy.get("weeklyPremium", 0),
        "basePremium": policy.get("basePremium", 0),
        "protection": policy.get("protection", 0),
        "badge": policy.get("badge", ""),
        "pricingMode": policy.get("pricingMode", "rules"),
        "pricingReasons": policy.get("pricingReasons", []),
        "effectiveDate": policy.get("effectiveDate"),
        "renewalDate": policy.get("renewalDate"),
        "createdAt": policy.get("createdAt"),
        "updatedAt": policy.get("updatedAt"),
    }
