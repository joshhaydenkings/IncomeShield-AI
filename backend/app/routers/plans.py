from fastapi import APIRouter, Depends

from ..deps import get_current_user
from ..repositories.user_state_repository import get_current_scenario_for_user
from ..services.plan_service import get_available_plans

router = APIRouter()


@router.get("/plans")
def get_plans(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    scenario = get_current_scenario_for_user(user_id)

    return {
        "plans": get_available_plans(worker=current_user, scenario=scenario),
        "currentScenario": scenario,
    }