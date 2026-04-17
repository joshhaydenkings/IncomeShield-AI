from pathlib import Path
from typing import Any, Optional

import joblib
import pandas as pd

MODEL_PATH = Path(__file__).resolve().parent.parent / "ml" / "models" / "risk_model.joblib"

_risk_bundle = None
_risk_load_failed = False


def _load_bundle():
    global _risk_bundle, _risk_load_failed

    if _risk_load_failed:
        return None

    if _risk_bundle is None and MODEL_PATH.exists():
        try:
            _risk_bundle = joblib.load(MODEL_PATH)
        except Exception as exc:
            print(f"[risk_model_service] Failed to load risk model, using fallback rules: {exc}")
            _risk_bundle = None
            _risk_load_failed = True

    return _risk_bundle


def _score_to_label(score: float) -> str:
    if score >= 75:
        return "low"
    if score >= 40:
        return "medium"
    return "high"


def _apply_scenario_guardrails(score: float, scenario: str) -> float:
    """
    Keeps scenario outputs demo-stable even when the ML model prediction drifts.
    """
    if scenario == "normal":
        return max(score, 82)

    if scenario == "rain":
        return min(max(score, 45), 68)

    if scenario == "flood":
        return min(score, 18)

    if scenario == "aqi":
        return min(max(score, 20), 38)

    if scenario == "outage":
        return min(max(score, 42), 62)

    if scenario == "gps_spoof":
        return min(score, 22)

    return score


def _fallback_risk(worker: Optional[dict], scenario: str) -> dict[str, Any]:
    score = 80

    scenario_adjustments = {
        "normal": 10,
        "rain": -25,
        "flood": -65,
        "aqi": -50,
        "outage": -35,
        "gps_spoof": -45,
    }
    score += scenario_adjustments.get(scenario, 0)

    if worker:
        shift = worker.get("shift", "")
        worker_type = worker.get("workerType", "")
        city = (worker.get("city", "") or "").strip().lower()

        if shift == "6 PM - 11 PM":
            score -= 8
        elif shift == "6 AM - 11 AM":
            score += 5

        if worker_type == "Ride Share":
            score -= 7
        elif worker_type == "Grocery / Quick Commerce":
            score -= 4

        if city in {"mumbai", "delhi"}:
            score -= 4

    score = max(0, min(100, score))
    score = _apply_scenario_guardrails(score, scenario)
    risk = _score_to_label(score)

    return {
        "riskScore": int(round(score)),
        "riskLabel": risk,
        "modelSource": "fallback_rules",
        "guardrailApplied": True,
    }


def predict_risk(worker: Optional[dict], scenario: str) -> dict[str, Any]:
    if not worker:
        return _fallback_risk(worker, scenario)

    bundle = _load_bundle()
    if bundle is None:
        return _fallback_risk(worker, scenario)

    try:
        feature_columns = bundle["feature_columns"]
        model = bundle["model"]

        row = pd.DataFrame(
            [
                {
                    "city": worker.get("city", ""),
                    "zone": worker.get("zone", ""),
                    "shift": worker.get("shift", ""),
                    "workerType": worker.get("workerType", ""),
                    "plan": worker.get("plan", "Core"),
                    "scenario": scenario,
                }
            ]
        )[feature_columns]

        predicted_score = float(model.predict(row)[0])
        predicted_score = max(0, min(100, predicted_score))
        guarded_score = _apply_scenario_guardrails(predicted_score, scenario)
        risk = _score_to_label(guarded_score)

        return {
            "riskScore": int(round(guarded_score)),
            "riskLabel": risk,
            "modelSource": "trained_model",
            "trainedAt": bundle.get("trained_at"),
            "modelType": bundle.get("model_type"),
            "rawModelScore": int(round(predicted_score)),
            "guardrailApplied": True,
        }
    except Exception as exc:
        print(f"[risk_model_service] Prediction failed, using fallback rules: {exc}")
        return _fallback_risk(worker, scenario)