from fastapi import APIRouter, Depends

from ..deps import get_current_user
from ..repositories.activity_repository import get_activity_for_user

router = APIRouter()


@router.get("/activity")
def get_activity(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    return {
        "items": get_activity_for_user(user_id),
    }