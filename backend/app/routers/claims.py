from fastapi import APIRouter, Depends

from ..deps import get_current_user
from ..repositories.activity_repository import add_activity
from ..repositories.claim_history_repository import (
    add_manual_claim_history,
    get_claim_history_for_user,
)
from ..repositories.user_state_repository import get_current_scenario_for_user
from ..schemas_manual_claim import ManualClaimRequest
from ..services.claim_service import build_claim
from ..services.plan_service import get_plan_by_name

router = APIRouter()


@router.get("/claims/current")
def get_current_claim(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    scenario = get_current_scenario_for_user(user_id)
    claim_data = build_claim(current_user, scenario)
    return claim_data


@router.get("/claims/history")
def get_claim_history(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    return {
        "items": get_claim_history_for_user(user_id)
    }


@router.post("/claims/manual")
def submit_manual_claim(
    payload: ManualClaimRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = str(current_user["_id"])
    scenario = get_current_scenario_for_user(user_id)
    plan_info = get_plan_by_name(current_user.get("plan", "Core"), worker=current_user, scenario=scenario)

    saved_claim, duplicate_blocked = add_manual_claim_history(
        user_id=user_id,
        scenario=scenario,
        plan_info=plan_info,
        reason=payload.reason,
    )

    if duplicate_blocked:
        add_activity("Duplicate manual claim blocked", scenario, user_id)
        return {
            "message": "A recent similar claim already exists.",
            "duplicateBlocked": True,
        }

    add_activity("Manual claim submitted", payload.reason, user_id)

    return {
        "message": "Manual claim submitted successfully",
        "duplicateBlocked": False,
        "claimNumber": saved_claim.get("claimNumber"),
    }