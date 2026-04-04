from fastapi import APIRouter, Depends

from ..deps import get_current_user
from ..repositories.policy_repository import (
    create_or_update_policy_for_user,
    get_policy_for_user,
    serialize_policy,
)
from ..repositories.user_state_repository import get_current_scenario_for_user
from ..services.plan_service import get_plan_by_name

router = APIRouter()


@router.get("/policy/current")
def get_current_policy(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    policy = get_policy_for_user(user_id)

    if not policy:
        scenario = get_current_scenario_for_user(user_id)
        plan_info = get_plan_by_name(current_user.get("plan", "Core"), worker=current_user, scenario=scenario)
        policy = create_or_update_policy_for_user(user_id, plan_info)

    return {"policy": serialize_policy(policy)}