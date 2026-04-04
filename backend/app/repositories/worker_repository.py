from datetime import datetime, timezone

from bson import ObjectId

from ..db import workers_collection


def _serialize_worker(doc):
    if not doc:
        return None

    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "city": doc["city"],
        "zone": doc["zone"],
        "shift": doc["shift"],
        "workerType": doc["workerType"],
        "language": doc["language"],
        "plan": doc["plan"],
        "createdAt": doc.get("createdAt"),
        "updatedAt": doc.get("updatedAt"),
    }


def create_worker(worker_data: dict):
    now = datetime.now(timezone.utc).isoformat()
    payload = {
        **worker_data,
        "createdAt": now,
        "updatedAt": now,
    }
    result = workers_collection.insert_one(payload)
    return get_worker_by_id(str(result.inserted_id))


def get_worker_by_id(worker_id: str):
    try:
        doc = workers_collection.find_one({"_id": ObjectId(worker_id)})
    except Exception:
        return None

    return _serialize_worker(doc)


def update_worker_plan(worker_id: str, plan: str):
    now = datetime.now(timezone.utc).isoformat()

    try:
        workers_collection.update_one(
            {"_id": ObjectId(worker_id)},
            {"$set": {"plan": plan, "updatedAt": now}},
        )
    except Exception:
        return None

    return get_worker_by_id(worker_id)
