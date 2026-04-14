from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.ml.fraud_model_service import score_fraud
from app.services.monitoring_service import get_monitoring_status, run_monitoring_scan


router = APIRouter(prefix="/monitoring", tags=["Monitoring"])


class FraudScoreRequest(BaseModel):
    claim_count_7d: int = Field(0, ge=0, le=20)
    gps_jump_score: float = Field(0.0, ge=0.0, le=1.0)
    device_change_count_30d: int = Field(0, ge=0, le=20)
    signal_match_score: float = Field(1.0, ge=0.0, le=1.0)
    trust_score: float = Field(1.0, ge=0.0, le=1.0)
    platform_inactivity_minutes: int = Field(0, ge=0, le=300)
    zone_risk_score: float = Field(0.0, ge=0.0, le=1.0)


@router.get("/status")
def monitoring_status():
    return get_monitoring_status()


@router.post("/run-now")
def run_monitoring_now():
    return run_monitoring_scan()


@router.post("/fraud-score")
def fraud_score(payload: FraudScoreRequest):
    return score_fraud(payload.model_dump())