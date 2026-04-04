from fastapi import APIRouter, Depends, HTTPException

from ..deps import get_current_user
from ..repositories.activity_repository import add_activity
from ..repositories.claim_history_repository import add_claim_history
from ..repositories.policy_repository import create_or_update_policy_for_user
from ..repositories.user_state_repository import (
    get_current_scenario_for_user,
    set_current_scenario_for_user,
)
from ..schemas import UpdateScenarioRequest
from ..services.claim_service import build_claim
from ..services.live_conditions_service import get_live_condition_result
from ..services.plan_service import get_available_plans, get_plan_by_name

router = APIRouter()


@router.get("/scenarios")
def get_scenarios(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    return {
        "currentScenario": get_current_scenario_for_user(user_id),
        "availableScenarios": get_available_plans(worker=current_user, scenario=get_current_scenario_for_user(user_id)),
    }


@router.put("/scenarios/current")
def update_current_scenario(
    payload: UpdateScenarioRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = str(current_user["_id"])
    set_current_scenario_for_user(user_id, payload.scenario)

    plan_info = get_plan_by_name(current_user.get("plan", "Core"), worker=current_user, scenario=payload.scenario)
    create_or_update_policy_for_user(user_id, plan_info)

    add_activity("Conditions updated", payload.scenario, user_id)

    claim_data = build_claim(current_user, payload.scenario)
    saved_claim, duplicate_blocked = add_claim_history(
        user_id=user_id,
        scenario=payload.scenario,
        claim=claim_data["claim"],
        plan_info=claim_data["planInfo"],
    )

    if duplicate_blocked:
        add_activity("Duplicate claim blocked", payload.scenario, user_id)

    return {
        "message": "Scenario updated successfully",
        "currentScenario": payload.scenario,
        "duplicateBlocked": duplicate_blocked,
    }


@router.post("/scenarios/live")
def update_scenario_from_live_data(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])

    result = get_live_condition_result(
        city=current_user["city"],
        zone=current_user.get("zone"),
    )
    if result["error"]:
        raise HTTPException(status_code=404, detail=result["reason"])

    live_scenario = result["mappedScenario"]
    set_current_scenario_for_user(user_id, live_scenario)

    plan_info = get_plan_by_name(current_user.get("plan", "Core"), worker=current_user, scenario=live_scenario)
    create_or_update_policy_for_user(user_id, plan_info)

    add_activity(
        "Live conditions synced",
        f"{result['queryUsed']} matched to {result['location']['name']}. {result['reason']}",
        user_id,
    )

    claim_data = build_claim(current_user, live_scenario)
    saved_claim, duplicate_blocked = add_claim_history(
        user_id=user_id,
        scenario=live_scenario,
        claim=claim_data["claim"],
        plan_info=claim_data["planInfo"],
    )

    if duplicate_blocked:
        add_activity("Duplicate claim blocked", live_scenario, user_id)

    return {
        "message": "Scenario updated from live public data",
        "currentScenario": live_scenario,
        "reason": result["reason"],
        "queryUsed": result["queryUsed"],
        "location": result["location"],
        "liveData": result["liveData"],
        "duplicateBlocked": duplicate_blocked,
    }