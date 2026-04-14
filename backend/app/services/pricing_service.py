from pathlib import Path
from typing import Optional

import joblib
import pandas as pd


BASE_PREMIUMS = {
    "Lite": 29,
    "Core": 39,
    "Shield+": 55,
}

MODEL_PATH = Path(__file__).resolve().parent.parent / "ml" / "models" / "pricing_model.joblib"
_pricing_model = None
_model_load_failed = False


def _load_model():
    global _pricing_model, _model_load_failed

    if _model_load_failed:
        return None

    if _pricing_model is None and MODEL_PATH.exists():
        try:
            _pricing_model = joblib.load(MODEL_PATH)
        except Exception as exc:
            print(f"[pricing_service] Failed to load pricing model, using fallback rules: {exc}")
            _model_load_failed = True
            _pricing_model = None

    return _pricing_model


def _clamp(plan_name: str, premium: float) -> int:
    base_premium = BASE_PREMIUMS.get(plan_name, 39)
    min_premium = max(19, base_premium - 4)
    max_premium = base_premium + 12
    return round(max(min_premium, min(max_premium, premium)))


def _rule_based_premium(plan_name: str, worker: Optional[dict], scenario: str) -> dict:
    base_premium = BASE_PREMIUMS.get(plan_name, 39)
    premium = base_premium
    reasons: list[str] = []

    if worker:
        shift = worker.get("shift", "")
        worker_type = worker.get("workerType", "")
        city = (worker.get("city", "") or "").strip().lower()
        zone = (worker.get("zone", "") or "").strip().lower()

        shift_adjustments = {
            "6 AM - 11 AM": -1,
            "11 AM - 4 PM": 0,
            "4 PM - 9 PM": 2,
            "6 PM - 11 PM": 4,
        }
        shift_delta = shift_adjustments.get(shift, 0)
        premium += shift_delta
        if shift_delta > 0:
            reasons.append(f"Evening shift risk adjustment: +₹{shift_delta}")
        elif shift_delta < 0:
            reasons.append(f"Morning shift discount: -₹{abs(shift_delta)}")

        worker_type_adjustments = {
            "Food Delivery": 0,
            "Parcel Delivery": 1,
            "Grocery / Quick Commerce": 2,
            "Ride Share": 3,
        }
        work_delta = worker_type_adjustments.get(worker_type, 0)
        premium += work_delta
        if work_delta > 0:
            reasons.append(f"Work type adjustment for {worker_type}: +₹{work_delta}")

        city_adjustments = {
            "chennai": 1,
            "mumbai": 2,
            "delhi": 2,
            "bengaluru": 1,
            "hyderabad": 1,
            "kolkata": 1,
            "itanagar": 0,
        }
        city_delta = city_adjustments.get(city, 0)
        premium += city_delta
        if city_delta > 0:
            reasons.append(f"City risk adjustment for {worker.get('city')}: +₹{city_delta}")

        higher_risk_zone_keywords = {
            "tambaram": 1,
            "potheri": 1,
            "velachery": 1,
            "thoraipakkam": 1,
        }
        for keyword, delta in higher_risk_zone_keywords.items():
            if keyword in zone:
                premium += delta
                reasons.append(f"Zone adjustment for {worker.get('zone')}: +₹{delta}")
                break

    scenario_adjustments = {
        "normal": -2,
        "rain": 2,
        "flood": 6,
        "aqi": 4,
        "outage": 3,
        "gps_spoof": 2,
    }
    scenario_delta = scenario_adjustments.get(scenario, 0)
    premium += scenario_delta
    if scenario_delta > 0:
        reasons.append(f"Current disruption adjustment ({scenario}): +₹{scenario_delta}")
    elif scenario_delta < 0:
        reasons.append(f"Stable conditions discount: -₹{abs(scenario_delta)}")

    premium = _clamp(plan_name, premium)

    if not reasons:
        reasons.append("Base weekly premium applied.")

    return {
        "basePremium": base_premium,
        "premium": premium,
        "pricingReasons": reasons,
        "pricingMode": "rules",
    }


def _hybrid_adjustments(worker: Optional[dict], scenario: str) -> tuple[int, list[str]]:
    delta = 0
    reasons: list[str] = []

    scenario_adjustments = {
        "normal": -2,
        "rain": 2,
        "flood": 6,
        "aqi": 4,
        "outage": 3,
        "gps_spoof": 2,
    }
    scenario_delta = scenario_adjustments.get(scenario, 0)
    delta += scenario_delta
    if scenario_delta > 0:
        reasons.append(f"Scenario adjustment after ML ({scenario}): +₹{scenario_delta}")
    elif scenario_delta < 0:
        reasons.append(f"Stable scenario adjustment after ML: -₹{abs(scenario_delta)}")

    if worker:
        shift = worker.get("shift", "")
        worker_type = worker.get("workerType", "")
        city = (worker.get("city", "") or "").strip().lower()

        if shift == "6 PM - 11 PM":
            delta += 1
            reasons.append("Late shift adjustment after ML: +₹1")
        elif shift == "6 AM - 11 AM":
            delta -= 1
            reasons.append("Morning shift adjustment after ML: -₹1")

        if worker_type == "Ride Share":
            delta += 1
            reasons.append("Ride share adjustment after ML: +₹1")
        elif worker_type == "Grocery / Quick Commerce":
            delta += 1
            reasons.append("Quick commerce adjustment after ML: +₹1")

        if city in {"mumbai", "delhi"}:
            delta += 1
            reasons.append(f"Metro city adjustment after ML ({worker.get('city')}): +₹1")

    return delta, reasons


def calculate_dynamic_premium(
    plan_name: str,
    worker: Optional[dict] = None,
    scenario: str = "normal",
) -> dict:
    base_premium = BASE_PREMIUMS.get(plan_name, 39)

    if worker:
        model = _load_model()
        if model is not None:
            try:
                row = pd.DataFrame(
                    [
                        {
                            "city": worker.get("city", ""),
                            "zone": worker.get("zone", ""),
                            "shift": worker.get("shift", ""),
                            "workerType": worker.get("workerType", ""),
                            "plan": plan_name,
                            "scenario": scenario,
                        }
                    ]
                )

                predicted = float(model.predict(row)[0])
                premium = round(predicted)

                hybrid_delta, hybrid_reasons = _hybrid_adjustments(worker, scenario)
                premium += hybrid_delta
                premium = _clamp(plan_name, premium)

                reasons = [
                    "ML pricing model estimated the base weekly premium.",
                    f"Plan base price: ₹{base_premium}",
                    f"ML inputs used: city, zone, shift, work type, plan, and scenario ({scenario}).",
                    f"Raw ML premium prediction: ₹{round(predicted)}",
                    *hybrid_reasons,
                ]

                if premium > base_premium:
                    reasons.append(f"Final premium is above base by ₹{premium - base_premium}.")
                elif premium < base_premium:
                    reasons.append(f"Final premium is below base by ₹{base_premium - premium}.")
                else:
                    reasons.append("Final premium matches the base price.")

                return {
                    "basePremium": base_premium,
                    "premium": premium,
                    "pricingReasons": reasons,
                    "pricingMode": "ml-hybrid",
                }
            except Exception as exc:
                print(f"[pricing_service] Prediction failed, using fallback rules: {exc}")

    return _rule_based_premium(plan_name, worker, scenario)
