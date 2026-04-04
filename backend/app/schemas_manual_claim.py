from pydantic import BaseModel, Field


class ManualClaimRequest(BaseModel):
    reason: str = Field(min_length=5, max_length=300)