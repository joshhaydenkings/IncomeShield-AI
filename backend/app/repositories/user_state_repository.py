from datetime import datetime, timezone

from ..db import db

user_state_collection = db["user_state"]


def get_or_create_user_state(user_id: str):
    existing = user_state_collection.find_one({"userId": user_id})
    if existing:
        return existing

    doc = {
        "userId": user_id,
        "currentScenario": "flood",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }
    user_state_collection.insert_one(doc)
    return doc


def get_current_scenario_for_user(user_id: str) -> str:
    state = get_or_create_user_state(user_id)
    return state.get("currentScenario", "flood")


def set_current_scenario_for_user(user_id: str, scenario: str):
    now = datetime.now(timezone.utc).isoformat()
    user_state_collection.update_one(
        {"userId": user_id},
        {
            "$set": {
                "currentScenario": scenario,
                "updatedAt": now,
            }
        },
        upsert=True,
    )