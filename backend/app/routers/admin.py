from fastapi import APIRouter, HTTPException

from ..repositories.app_state_repository import (
    get_current_scenario,
    get_current_worker_id,
)
from ..repositories.worker_repository import get_worker_by_id
from ..services.admin_service import build_admin_review

router = APIRouter()


@router.get("/admin/review")
def get_admin_review():
    worker_id = get_current_worker_id()
    if not worker_id:
        raise HTTPException(status_code=404, detail="No worker found")

    worker = get_worker_by_id(worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="No worker found")

    scenario = get_current_scenario()
    return build_admin_review(worker, scenario)