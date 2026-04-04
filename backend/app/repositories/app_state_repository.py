from ..db import app_state_collection

STATE_ID = "singleton"


def ensure_app_state():
    state = app_state_collection.find_one({"_id": STATE_ID})
    if state is None:
        app_state_collection.insert_one(
            {
                "_id": STATE_ID,
                "currentWorkerId": None,
                "currentScenario": "flood",
            }
        )
        state = app_state_collection.find_one({"_id": STATE_ID})
    return state


def get_current_worker_id():
    state = ensure_app_state()
    return state.get("currentWorkerId")


def set_current_worker_id(worker_id: str | None):
    ensure_app_state()
    app_state_collection.update_one(
        {"_id": STATE_ID},
        {"$set": {"currentWorkerId": worker_id}},
        upsert=True,
    )


def get_current_scenario():
    state = ensure_app_state()
    return state.get("currentScenario", "flood")


def set_current_scenario(scenario: str):
    ensure_app_state()
    app_state_collection.update_one(
        {"_id": STATE_ID},
        {"$set": {"currentScenario": scenario}},
        upsert=True,
    )


def reset_app_state():
    app_state_collection.update_one(
        {"_id": STATE_ID},
        {"$set": {"currentWorkerId": None, "currentScenario": "flood"}},
        upsert=True,
    )