from typing import Literal

from pydantic import BaseModel


PlanName = Literal["Lite", "Core", "Shield+"]
ScenarioKey = Literal["normal", "rain", "flood", "aqi", "outage", "gps_spoof"]


class WorkerProfile(BaseModel):
    name: str
    city: str
    zone: str
    shift: str
    workerType: str
    language: str
    plan: PlanName


class UpdatePlanRequest(BaseModel):
    plan: PlanName


class UpdateScenarioRequest(BaseModel):
    scenario: ScenarioKey

class UpdateLocationRequest(BaseModel):
    city: str
    zone: str | None = ""
    pincode: str | None = ""