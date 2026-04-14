from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, roc_auc_score
from sklearn.model_selection import train_test_split


FEATURE_ORDER = [
    "claim_count_7d",
    "gps_jump_score",
    "device_change_count_30d",
    "signal_match_score",
    "trust_score",
    "platform_inactivity_minutes",
    "zone_risk_score",
]

MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_FILE = MODEL_DIR / "fraud_model.joblib"


def build_synthetic_dataset(n_samples: int = 3000, seed: int = 42):
    rng = np.random.default_rng(seed)

    claim_count_7d = rng.integers(0, 8, size=n_samples)
    gps_jump_score = rng.uniform(0.0, 1.0, size=n_samples)
    device_change_count_30d = rng.integers(0, 5, size=n_samples)
    signal_match_score = rng.uniform(0.0, 1.0, size=n_samples)
    trust_score = rng.uniform(0.0, 1.0, size=n_samples)
    platform_inactivity_minutes = rng.integers(0, 121, size=n_samples)
    zone_risk_score = rng.uniform(0.0, 1.0, size=n_samples)

    X = np.column_stack(
        [
            claim_count_7d,
            gps_jump_score,
            device_change_count_30d,
            signal_match_score,
            trust_score,
            platform_inactivity_minutes,
            zone_risk_score,
        ]
    )

    # Synthetic fraud label generation for hackathon baseline training
    risk_signal = (
        (claim_count_7d >= 4).astype(int) * 0.9
        + (gps_jump_score >= 0.75).astype(int) * 1.3
        + (device_change_count_30d >= 2).astype(int) * 0.6
        + (signal_match_score <= 0.35).astype(int) * 0.8
        + (trust_score <= 0.35).astype(int) * 0.8
        + (platform_inactivity_minutes <= 10).astype(int) * 0.3
        + (zone_risk_score >= 0.8).astype(int) * 0.2
        + rng.normal(0, 0.25, size=n_samples)
    )

    y = (risk_signal >= 1.8).astype(int)
    return X, y


def main():
    X, y = build_synthetic_dataset()

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        random_state=42,
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1]

    accuracy = accuracy_score(y_test, preds)
    auc = roc_auc_score(y_test, probs)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    bundle = {
        "model": model,
        "feature_order": FEATURE_ORDER,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "metrics": {
            "accuracy": round(float(accuracy), 4),
            "roc_auc": round(float(auc), 4),
        },
        "note": "Synthetic training baseline for hackathon demo. Replace with real claims data when available.",
    }

    joblib.dump(bundle, MODEL_FILE)

    print("Fraud model trained and saved")
    print(f"Model path: {MODEL_FILE}")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"ROC AUC: {auc:.4f}")


if __name__ == "__main__":
    main()