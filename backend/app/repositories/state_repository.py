from typing import Any

from ..db import app_state_collection

STATE_ID = "singleton"

DEFAULT_STATE = {
    "_id": STATE_ID,
    "current_worker": None,
    "current_scenario": "flood",
}


def _ensure_state_document() -> dict[str, Any]:
    state = app_state_collection.find_one({"_id": STATE_ID})

    if state is None:
        app_state_collection.insert_one(DEFAULT_STATE.copy())
        state = app_state_collection.find_one({"_id": STATE_ID})

    return state or DEFAULT_STATE.copy()


def get_worker() -> dict[str, Any] | None:
    state = _ensure_state_document()
    return state.get("current_worker")


def save_worker(worker: dict[str, Any] | None) -> None:
    _ensure_state_document()
    app_state_collection.update_one(
        {"_id": STATE_ID},
        {"$set": {"current_worker": worker}},
    )


def get_scenario() -> str:
    state = _ensure_state_document()
    return state.get("current_scenario", "flood")


def save_scenario(scenario: str) -> None:
    _ensure_state_document()
    app_state_collection.update_one(
        {"_id": STATE_ID},
        {"$set": {"current_scenario": scenario}},
    )


def reset() -> None:
    app_state_collection.update_one(
        {"_id": STATE_ID},
        {"$set": {"current_worker": None, "current_scenario": "flood"}},
        upsert=True,
    )
