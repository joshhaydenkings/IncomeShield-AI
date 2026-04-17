import json
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException

from ..auth import create_access_token, hash_password, verify_password
from ..deps import get_current_user
from ..repositories.user_repository import (
    create_user,
    get_user_by_email,
    serialize_user,
    update_user_profile,
)
from ..services.geocoding_service import geocode_indian_location
from ..schemas_auth import LoginRequest, ProfileSetupRequest, SignupRequest

router = APIRouter(prefix="/auth", tags=["auth"])

APP_DIR = Path(__file__).resolve().parents[1]
APP_STATE_FILE = APP_DIR / "state.json"


def _sync_current_worker_snapshot(worker: dict) -> None:
    state: dict = {}

    if APP_STATE_FILE.exists():
        try:
            state = json.loads(APP_STATE_FILE.read_text(encoding="utf-8"))
            if not isinstance(state, dict):
                state = {}
        except Exception:
            state = {}

    state["current_worker"] = serialize_user(worker)
    APP_STATE_FILE.write_text(
        json.dumps(state, indent=2, default=str),
        encoding="utf-8",
    )


@router.post("/signup")
def signup(payload: SignupRequest):
    existing = get_user_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = create_user(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )

    token = create_access_token(str(user["_id"]))

    return {
        "message": "Account created successfully",
        "token": token,
        "user": serialize_user(user),
    }


@router.post("/login")
def login(payload: LoginRequest):
    user = get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(str(user["_id"]))

    return {
        "message": "Login successful",
        "token": token,
        "user": serialize_user(user),
    }


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    return {
        "user": serialize_user(current_user),
    }


@router.put("/profile")
def update_profile(
    payload: ProfileSetupRequest,
    current_user: dict = Depends(get_current_user),
):
    city_changed = (payload.city or "").strip() != (current_user.get("city") or "").strip()
    zone_changed = (payload.zone or "").strip() != (current_user.get("zone") or "").strip()
    pincode_changed = (payload.pincode or "").strip() != (current_user.get("pincode") or "").strip()
    location_changed = city_changed or zone_changed or pincode_changed

    profile_updates = {
        "city": payload.city,
        "zone": payload.zone,
        "pincode": payload.pincode or "",
        "shift": payload.shift,
        "workerType": payload.workerType,
        "language": payload.language,
        "plan": payload.plan,
        "profileCompleted": True,
    }

    if location_changed or current_user.get("latitude") is None or current_user.get("longitude") is None:
        try:
            location = geocode_indian_location(
                city=payload.city,
                zone=payload.zone or "",
                pincode=payload.pincode or "",
            )
            profile_updates.update(
                {
                    "normalized_location": location["normalized_location"],
                    "resolved_name": location["resolved_name"],
                    "resolved_admin1": location["resolved_admin1"],
                    "resolved_country": location["resolved_country"],
                    "latitude": location["latitude"],
                    "longitude": location["longitude"],
                    "timezone": location["timezone"],
                }
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        except Exception:
            raise HTTPException(
                status_code=502,
                detail="Location lookup failed. Please enter a clearer Indian city or area.",
            )
    else:
        profile_updates.update(
            {
                "normalized_location": current_user.get("normalized_location", ""),
                "resolved_name": current_user.get("resolved_name", ""),
                "resolved_admin1": current_user.get("resolved_admin1", ""),
                "resolved_country": current_user.get("resolved_country", ""),
                "latitude": current_user.get("latitude"),
                "longitude": current_user.get("longitude"),
                "timezone": current_user.get("timezone", "Asia/Kolkata"),
            }
        )
    

    updated = update_user_profile(
        str(current_user["_id"]),
        profile_updates,
    )

    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update profile")

    try:
        _sync_current_worker_snapshot(updated)
    except Exception:
        pass

    return {
        "message": "Profile updated successfully",
        "user": serialize_user(updated),
    }
