from datetime import datetime, timezone

from ..db import db

activity_collection = db["activity_history"]


def add_activity(title: str, detail: str, user_id: str):
    doc = {
        "userId": user_id,
        "title": title,
        "detail": detail,
        "time": "Now",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    activity_collection.insert_one(doc)
    return doc


def get_activity_for_user(user_id: str, limit: int = 10):
    items = list(
        activity_collection.find({"userId": user_id}).sort("createdAt", -1).limit(limit)
    )

    return [
        {
            "id": str(item["_id"]),
            "title": item.get("title", ""),
            "detail": item.get("detail", ""),
            "time": item.get("time", "Now"),
        }
        for item in items
    ]