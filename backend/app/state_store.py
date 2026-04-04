import json
from copy import deepcopy
from pathlib import Path
from typing import Any

STATE_FILE = Path(__file__).with_name("state.json")

DEFAULT_STATE = {
    "current_worker": None,
    "current_scenario": "flood",
}


def _ensure_state_file() -> None:
    if not STATE_FILE.exists():
        STATE_FILE.write_text(
            json.dumps(DEFAULT_STATE, indent=2),
            encoding="utf-8",
        )


def load_state() -> dict[str, Any]:
    _ensure_state_file()

    try:
        raw = STATE_FILE.read_text(encoding="utf-8")
        data = json.loads(raw)

        if "current_worker" not in data:
            data["current_worker"] = None
        if "current_scenario" not in data:
            data["current_scenario"] = "flood"

        return data
    except Exception:
        reset_state()
        return deepcopy(DEFAULT_STATE)


def save_state(state: dict[str, Any]) -> None:
    STATE_FILE.write_text(
        json.dumps(state, indent=2),
        encoding="utf-8",
    )


def get_current_worker() -> dict[str, Any] | None:
    state = load_state()
    return state.get("current_worker")


def set_current_worker(worker: dict[str, Any] | None) -> None:
    state = load_state()
    state["current_worker"] = worker
    save_state(state)


def get_current_scenario() -> str:
    state = load_state()
    return state.get("current_scenario", "flood")


def set_current_scenario(scenario: str) -> None:
    state = load_state()
    state["current_scenario"] = scenario
    save_state(state)


def reset_state() -> None:
    save_state(deepcopy(DEFAULT_STATE))