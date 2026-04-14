from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import numpy as np


FEATURE_ORDER = [
    "claim_count_7d",
    "gps_jump_score",
    "device_change_count_30d",
    "signal_match_score",
    "trust_score",
    "platform_inactivity_minutes",
    "zone_risk_score",
]

MODEL_FILE = Path(__file__).resolve().parent / "models" / "fraud_model.joblib"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _rule_based_fallback(features: dict[str, float]) -> dict[str, Any]:
    score = 0.0

    score += min(features.get("claim_count_7d", 0) / 6.0, 1.0) * 0.20
    score += min(features.get("gps_jump_score", 0.0), 1.0) * 0.30
    score += min(features.get("device_change_count_30d", 0) / 4.0, 1.0) * 0.15
    score += (1.0 - min(features.get("signal_match_score", 1.0), 1.0)) * 0.15
    score += (1.0 - min(features.get("trust_score", 1.0), 1.0)) * 0.10
    score += max(0.0, (30.0 - min(features.get("platform_inactivity_minutes", 0), 30)) / 30.0) * 0.05
    score += min(features.get("zone_risk_score", 0.0), 1.0) * 0.05

    probability = max(0.0, min(score, 0.99))
    decision = "manual_review" if probability >= 0.65 else "auto_process"

    return {
        "timestamp": _now_iso(),
        "model_source": "fallback_rules",
        "fraud_probability": round(float(probability), 4),
        "decision": decision,
    }


def score_fraud(features: dict[str, float]) -> dict[str, Any]:
    normalized = {name: float(features.get(name, 0.0)) for name in FEATURE_ORDER}

    if not MODEL_FILE.exists():
        return _rule_based_fallback(normalized)

    try:
        bundle = joblib.load(MODEL_FILE)
        model = bundle["model"]
        feature_order = bundle["feature_order"]
        trained_at = bundle.get("trained_at")

        vector = np.array(
            [[float(normalized.get(name, 0.0)) for name in feature_order]],
            dtype=float,
        )

        fraud_probability = float(model.predict_proba(vector)[0][1])
        decision = "manual_review" if fraud_probability >= 0.65 else "auto_process"

        return {
            "timestamp": _now_iso(),
            "model_source": "trained_model",
            "trained_at": trained_at,
            "fraud_probability": round(fraud_probability, 4),
            "decision": decision,
        }

    except Exception as exc:
        fallback = _rule_based_fallback(normalized)
        fallback["warning"] = f"Model load/predict failed, fallback used: {exc}"
        return fallback