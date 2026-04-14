from fastapi import APIRouter, Depends

from ..deps import get_current_user
from ..repositories.claim_history_repository import get_claim_history_for_user

router = APIRouter()


@router.get("/claims/history", operation_id="read_claim_history")
def get_claim_history(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    return {
        "items": get_claim_history_for_user(user_id),
    }