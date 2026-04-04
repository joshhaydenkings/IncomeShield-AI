from fastapi import APIRouter, Depends, HTTPException

from ..deps import get_current_user
from ..repositories.activity_repository import add_activity
from ..repositories.policy_repository import create_or_update_policy_for_user, serialize_policy
from ..repositories.user_repository import serialize_user, update_user_plan
from ..repositories.user_state_repository import get_current_scenario_for_user
from ..schemas import UpdatePlanRequest
from ..services.plan_service import get_plan_by_name

router = APIRouter()


@router.get("/worker/current")
def get_current_worker(current_user: dict = Depends(get_current_user)):
    return {"worker": serialize_user(current_user)}


@router.put("/worker/plan")
def update_worker_plan(
    payload: UpdatePlanRequest,
    current_user: dict = Depends(get_current_user),
):
    scenario = get_current_scenario_for_user(str(current_user["_id"]))
    plan_info = get_plan_by_name(payload.plan, worker=current_user, scenario=scenario)
    if not plan_info:
        raise HTTPException(status_code=404, detail="Plan not found")

    updated_user = update_user_plan(str(current_user["_id"]), payload.plan)
    policy = create_or_update_policy_for_user(str(current_user["_id"]), plan_info)
    add_activity("Plan updated", payload.plan, str(current_user["_id"]))

    return {
        "message": "Worker plan updated successfully",
        "worker": serialize_user(updated_user),
        "planInfo": plan_info,
        "policy": serialize_policy(policy),
    }