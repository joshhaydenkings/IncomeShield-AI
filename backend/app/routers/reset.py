from fastapi import APIRouter, Depends

from ..deps import get_current_user
from ..db import db
from ..repositories.user_state_repository import set_current_scenario_for_user

router = APIRouter()


@router.post("/reset")
def reset_state(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])

    db["activity_history"].delete_many({"userId": user_id})
    db["claim_history"].delete_many({"userId": user_id})
    set_current_scenario_for_user(user_id, "flood")

    return {"message": "User state reset successfully"}