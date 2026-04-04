from typing import Optional

from .pricing_service import calculate_dynamic_premium


PLAN_CATALOG = {
    "Lite": {
        "name": "Lite",
        "protection": 500,
        "badge": "Affordable entry protection",
    },
    "Core": {
        "name": "Core",
        "protection": 1200,
        "badge": "Balanced weekly protection",
    },
    "Shield+": {
        "name": "Shield+",
        "protection": 2500,
        "badge": "Highest coverage and support",
    },
}


def build_plan(plan_name: str, worker: Optional[dict] = None, scenario: str = "normal") -> dict:
    base = PLAN_CATALOG[plan_name]
    pricing = calculate_dynamic_premium(plan_name, worker=worker, scenario=scenario)

    return {
        "name": base["name"],
        "premium": pricing["premium"],
        "basePremium": pricing["basePremium"],
        "protection": base["protection"],
        "badge": base["badge"],
        "pricingReasons": pricing["pricingReasons"],
        "pricingMode": pricing["pricingMode"],
    }


def get_plan_by_name(
    plan_name: str,
    worker: Optional[dict] = None,
    scenario: str = "normal",
) -> Optional[dict]:
    if plan_name not in PLAN_CATALOG:
        return None
    return build_plan(plan_name, worker=worker, scenario=scenario)


def get_available_plans(
    worker: Optional[dict] = None,
    scenario: str = "normal",
) -> list[dict]:
    return [
        build_plan(plan_name, worker=worker, scenario=scenario)
        for plan_name in ["Lite", "Core", "Shield+"]
    ]