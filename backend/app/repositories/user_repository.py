from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId

from ..db import db

users_collection = db["users"]


def create_user(
    *,
    name: str,
    email: str,
    password_hash: str,
) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "name": name,
        "email": email.lower().strip(),
        "passwordHash": password_hash,
        "city": "",
        "zone": "",
        "shift": "",
        "workerType": "",
        "language": "en",
        "plan": "Core",
        "profileCompleted": False,
        "createdAt": now,
        "updatedAt": now,
    }
    result = users_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


def get_user_by_email(email: str) -> Optional[dict]:
    return users_collection.find_one({"email": email.lower().strip()})


def get_user_by_id(user_id: str) -> Optional[dict]:
    try:
        return users_collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None


def update_user_profile(user_id: str, profile: dict) -> Optional[dict]:
    profile["updatedAt"] = datetime.now(timezone.utc).isoformat()
    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": profile},
    )
    return get_user_by_id(user_id)


def update_user_plan(user_id: str, plan: str) -> Optional[dict]:
    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "plan": plan,
                "updatedAt": datetime.now(timezone.utc).isoformat(),
            }
        },
    )
    return get_user_by_id(user_id)


def serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "city": user.get("city", ""),
        "zone": user.get("zone", ""),
        "shift": user.get("shift", ""),
        "workerType": user.get("workerType", ""),
        "language": user.get("language", "en"),
        "plan": user.get("plan", "Core"),
        "profileCompleted": user.get("profileCompleted", False),
        "createdAt": user.get("createdAt"),
        "updatedAt": user.get("updatedAt"),
    }