import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from .routers.activity import router as activity_router
from .routers.admin import router as admin_router
from .routers.auth import router as auth_router
from .routers.claim_history import router as claim_history_router
from .routers.claims import router as claims_router
from .routers.health import router as health_router
from .routers.plans import router as plans_router
from .routers.policy import router as policy_router
from .routers.reset import router as reset_router
from .routers.scenarios import router as scenarios_router
from .routers.worker import router as worker_router

app = FastAPI(title="IncomeShield AI Backend", version="0.1.0")

frontend_url = os.getenv("FRONTEND_URL", "").strip()

allowed_origins = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
}

if frontend_url:
    allowed_origins.add(frontend_url)


def is_allowed_origin(origin: str | None) -> bool:
    if not origin:
        return False
    if origin in allowed_origins:
        return True
    return origin.endswith(".vercel.app") and origin.startswith("https://")


app.add_middleware(
    CORSMiddleware,
    allow_origins=list(allowed_origins),
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    origin = request.headers.get("origin")

    if request.method == "OPTIONS" and is_allowed_origin(origin):
        response = Response(status_code=200)
    else:
        response = await call_next(request)

    if is_allowed_origin(origin):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"

    return response


app.include_router(health_router)
app.include_router(auth_router)
app.include_router(plans_router)
app.include_router(policy_router)
app.include_router(scenarios_router)
app.include_router(worker_router)
app.include_router(claims_router)
app.include_router(claim_history_router)
app.include_router(activity_router)
app.include_router(admin_router)
app.include_router(reset_router)