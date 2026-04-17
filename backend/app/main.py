from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
from .services.scheduler_service import shutdown_scheduler, start_scheduler
from .routers.monitoring import router as monitoring_router


app = FastAPI(title="IncomeShield AI Backend", version="0.1.0")

# Demo/hackathon-safe CORS:
# JWT is sent in Authorization headers, not cookies.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    start_scheduler()


@app.on_event("shutdown")
def on_shutdown():
    shutdown_scheduler()


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
app.include_router(monitoring_router)