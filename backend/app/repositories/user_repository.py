from datetime import datetime, timezone
from typing import Any

from bson import ObjectId

from ..db import db

users_collection = db["users"]


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def serialize_user(user: dict[str, Any] | None) -> dict[str, Any] | None:
    if not user:
        return None

    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "city": user.get("city", ""),
        "zone": user.get("zone", ""),
        "pincode": user.get("pincode", ""),
        "normalized_location": user.get("normalized_location", ""),
        "resolved_name": user.get("resolved_name", ""),
        "resolved_admin1": user.get("resolved_admin1", ""),
        "resolved_country": user.get("resolved_country", ""),
        "latitude": user.get("latitude"),
        "longitude": user.get("longitude"),
        "timezone": user.get("timezone", ""),
        "shift": user.get("shift", ""),
        "workerType": user.get("workerType", ""),
        "language": user.get("language", "en"),
        "plan": user.get("plan", "Core"),
        "profileCompleted": user.get("profileCompleted", False),
        "createdAt": user.get("createdAt"),
        "updatedAt": user.get("updatedAt"),
    }


def create_user(name: str, email: str, password_hash: str) -> dict[str, Any]:
    now = _utc_now()
    user_doc = {
        "name": name,
        "email": email.lower().strip(),
        "password_hash": password_hash,
        "city": "",
        "zone": "",
        "pincode": "",
        "normalized_location": "",
        "resolved_name": "",
        "resolved_admin1": "",
        "resolved_country": "",
        "latitude": None,
        "longitude": None,
        "timezone": "",
        "shift": "",
        "workerType": "",
        "language": "en",
        "plan": "Core",
        "profileCompleted": False,
        "createdAt": now,
        "updatedAt": now,
    }

    result = users_collection.insert_one(user_doc)
    created_user = users_collection.find_one({"_id": result.inserted_id})
    if not created_user:
        raise RuntimeError("Failed to create user.")
    return created_user


def get_user_by_email(email: str) -> dict[str, Any] | None:
    return users_collection.find_one({"email": email.lower().strip()})


def get_user_by_id(user_id: str) -> dict[str, Any] | None:
    try:
        return users_collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None


def update_user_profile(user_id: str, profile_updates: dict[str, Any]) -> dict[str, Any] | None:
    allowed_fields = {
        "city",
        "zone",
        "pincode",
        "normalized_location",
        "resolved_name",
        "resolved_admin1",
        "resolved_country",
        "latitude",
        "longitude",
        "timezone",
        "shift",
        "workerType",
        "language",
        "plan",
        "profileCompleted",
        "name",
    }

    safe_updates = {k: v for k, v in profile_updates.items() if k in allowed_fields}
    if not safe_updates:
        return get_user_by_id(user_id)

    if any(
        field in safe_updates
        for field in ["city", "zone", "shift", "workerType", "language", "plan"]
    ):
        safe_updates["profileCompleted"] = True

    safe_updates["updatedAt"] = _utc_now()

    try:
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": safe_updates},
        )
    except Exception:
        return None

    return get_user_by_id(user_id)


def update_user_location(user_id: str, location_update: dict[str, Any]) -> dict[str, Any] | None:
    return update_user_profile(user_id, location_update)


def update_user_plan(user_id: str, plan: str) -> dict[str, Any] | None:
    return update_user_profile(user_id, {"plan": plan})


def get_all_users_basic() -> list[dict[str, Any]]:
    return list(users_collection.find({}))
