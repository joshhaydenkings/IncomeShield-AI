from pathlib import Path
import joblib
import pandas as pd

ROOT = Path(__file__).resolve().parent
MODEL_DIR = ROOT / "artifacts"

risk_model = joblib.load(MODEL_DIR / "risk_model.joblib")
fraud_model = joblib.load(MODEL_DIR / "fraud_model.joblib")


def predict_worker_risk(city: str, shift: str, worker_type: str, plan: str, scenario: str):
    X = pd.DataFrame(
        [
            {
                "city": city,
                "shift": shift,
                "workerType": worker_type,
                "plan": plan,
                "scenario": scenario,
            }
        ]
    )

    risk = risk_model.predict(X)[0]
    fraud = int(fraud_model.predict(X)[0])

    return {
        "predictedRisk": risk,
        "predictedFraud": bool(fraud),
    }