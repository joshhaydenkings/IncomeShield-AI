import json
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException

from ..deps import get_current_user
from ..repositories.activity_repository import add_activity
from ..repositories.policy_repository import create_or_update_policy_for_user, serialize_policy
from ..repositories.user_repository import (
    serialize_user,
    update_user_location,
    update_user_plan,
)
from ..repositories.user_state_repository import get_current_scenario_for_user
from ..schemas import UpdateLocationRequest, UpdatePlanRequest
from ..services.geocoding_service import geocode_indian_location
from ..services.plan_service import get_plan_by_name

router = APIRouter()

APP_DIR = Path(__file__).resolve().parents[1]
APP_STATE_FILE = APP_DIR / "state.json"


def _sync_current_worker_snapshot(worker: dict) -> None:
    """
    Sync the worker snapshot used by the app-level state file so that
    monitoring immediately follows the newly saved worker location.
    """
    state: dict = {}

    if APP_STATE_FILE.exists():
        try:
            state = json.loads(APP_STATE_FILE.read_text(encoding="utf-8"))
            if not isinstance(state, dict):
                state = {}
        except Exception:
            state = {}

    state["current_worker"] = serialize_user(worker)
    APP_STATE_FILE.write_text(
        json.dumps(state, indent=2, default=str),
        encoding="utf-8",
    )


@router.get("/worker/current")
def get_current_worker(current_user: dict = Depends(get_current_user)):
    return {"worker": serialize_user(current_user)}


@router.put("/worker/location")
def update_worker_location_route(
    payload: UpdateLocationRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        location = geocode_indian_location(
            city=payload.city,
            zone=payload.zone or "",
            pincode=payload.pincode or "",
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Location lookup failed. Please enter a clearer Indian city or area.",
        )

    location_update = {
        "city": payload.city,
        "zone": payload.zone or "",
        "pincode": payload.pincode or "",
        "normalized_location": location["normalized_location"],
        "resolved_name": location["resolved_name"],
        "resolved_admin1": location["resolved_admin1"],
        "resolved_country": location["resolved_country"],
        "latitude": location["latitude"],
        "longitude": location["longitude"],
        "timezone": location["timezone"],
    }

    updated_user = update_user_location(str(current_user["_id"]), location_update)
    if not updated_user:
        raise HTTPException(status_code=500, detail="Failed to update worker location")

    try:
        _sync_current_worker_snapshot(updated_user)
    except Exception:
        pass

    add_activity(
        "Location updated",
        location_update["normalized_location"],
        str(current_user["_id"]),
    )

    return {
        "message": "Worker location updated successfully",
        "worker": serialize_user(updated_user),
    }


@router.put("/worker/plan")
def update_worker_plan_route(
    payload: UpdatePlanRequest,
    current_user: dict = Depends(get_current_user),
):
    scenario = get_current_scenario_for_user(str(current_user["_id"]))
    plan_info = get_plan_by_name(payload.plan, worker=current_user, scenario=scenario)
    if not plan_info:
        raise HTTPException(status_code=404, detail="Plan not found")

    updated_user = update_user_plan(str(current_user["_id"]), payload.plan)
    if not updated_user:
        raise HTTPException(status_code=500, detail="Failed to update worker plan")

    policy = create_or_update_policy_for_user(str(current_user["_id"]), plan_info)
    add_activity("Plan updated", payload.plan, str(current_user["_id"]))

    return {
        "message": "Worker plan updated successfully",
        "worker": serialize_user(updated_user),
        "planInfo": plan_info,
        "policy": serialize_policy(policy),
    }
