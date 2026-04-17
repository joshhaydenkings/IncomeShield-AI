from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from ..repositories.activity_repository import add_activity
from ..repositories.user_repository import get_all_users_basic
from ..repositories.user_state_repository import (
    get_current_scenario_for_user,
    set_current_scenario_for_user,
)
from ..repositories.policy_repository import create_or_update_policy_for_user
from ..repositories.claim_history_repository import add_claim_history
from ..services.claim_service import build_claim
from ..services.live_conditions_service import get_live_condition_result
from ..services.plan_service import get_plan_by_name

scheduler = BackgroundScheduler()
_scheduler_started = False


def monitor_workers_job():
    users = get_all_users_basic()

    for user in users:
        try:
            user_id = str(user["_id"])
            city = user.get("city")

            if not city:
                continue

            result = get_live_condition_result(
                city=city,
                zone=user.get("zone"),
            )

            if result.get("error"):
                add_activity(
                    "Scheduler check failed",
                    result.get("reason", "Live condition lookup failed."),
                    user_id,
                )
                continue

            new_scenario = result["mappedScenario"]
            previous_scenario = get_current_scenario_for_user(user_id)

            add_activity(
                "Scheduler checked conditions",
                f"{result['queryUsed']} -> {new_scenario}",
                user_id,
            )

            if new_scenario == previous_scenario:
                continue

            set_current_scenario_for_user(user_id, new_scenario)

            plan_info = get_plan_by_name(
                user.get("plan", "Core"),
                worker=user,
                scenario=new_scenario,
            )
            create_or_update_policy_for_user(user_id, plan_info)

            claim_data = build_claim(user, new_scenario)
            add_claim_history(
                user_id=user_id,
                scenario=new_scenario,
                claim=claim_data["claim"],
                plan_info=claim_data["planInfo"],
            )

            add_activity(
                "Scenario auto-updated by scheduler",
                f"{previous_scenario} -> {new_scenario}",
                user_id,
            )

        except Exception as exc:
            try:
                add_activity(
                    "Scheduler internal error",
                    str(exc),
                    str(user.get("_id", "")),
                )
            except Exception:
                pass


def start_scheduler():
    global _scheduler_started

    if _scheduler_started:
        return

    scheduler.add_job(
        monitor_workers_job,
        trigger=IntervalTrigger(minutes=1),
        id="monitor_workers_job",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )
    scheduler.start()
    _scheduler_started = True


def shutdown_scheduler():
    global _scheduler_started

    if scheduler.running:
        scheduler.shutdown(wait=False)
    _scheduler_started = False
