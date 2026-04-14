from fastapi import APIRouter, Depends, HTTPException

from ..auth import create_access_token, hash_password, verify_password
from ..deps import get_current_user

from ..repositories.user_repository import (
    create_user,
    get_user_by_email,
    serialize_user,
    update_user_profile,
)
from ..schemas_auth import LoginRequest, ProfileSetupRequest, SignupRequest

router = APIRouter(prefix="/auth", tags=["auth"])


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
    updated = update_user_profile(
        str(current_user["_id"]),
        {
            "city": payload.city,
            "zone": payload.zone,
            "shift": payload.shift,
            "workerType": payload.workerType,
            "language": payload.language,
            "plan": payload.plan,
            "profileCompleted": True,
        },
    )

    return {
        "message": "Profile updated successfully",
        "user": serialize_user(updated),
    }