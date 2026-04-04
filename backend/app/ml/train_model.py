from pathlib import Path
import random
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.tree import DecisionTreeClassifier

ROOT = Path(__file__).resolve().parent
MODEL_DIR = ROOT / "artifacts"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

cities = ["Chennai", "Mumbai", "Bengaluru", "Hyderabad"]
shifts = ["6 AM - 11 AM", "11 AM - 4 PM", "4 PM - 9 PM", "6 PM - 11 PM"]
worker_types = ["Food Delivery", "Grocery / Quick Commerce", "Parcel Delivery"]
plans = ["Lite", "Core", "Shield+"]
scenarios = ["normal", "rain", "flood", "aqi", "outage", "gps_spoof"]


def generate_row():
    city = random.choice(cities)
    shift = random.choice(shifts)
    worker_type = random.choice(worker_types)
    plan = random.choice(plans)
    scenario = random.choice(scenarios)

    risk = "low"
    fraud = 0

    if scenario == "normal":
        risk = "low"
    elif scenario in ["rain", "outage"]:
        risk = "medium"
    elif scenario in ["flood", "aqi"]:
        risk = "high"
    elif scenario == "gps_spoof":
        risk = "high"
        fraud = 1

    if city == "Mumbai" and scenario in ["rain", "flood"]:
        risk = "high"
    if worker_type == "Grocery / Quick Commerce" and scenario in ["rain", "outage"]:
        risk = "high"
    if shift == "6 PM - 11 PM" and scenario in ["outage", "gps_spoof"]:
        fraud = 1 if random.random() < 0.45 else fraud
    if plan == "Lite" and scenario in ["flood", "aqi"]:
        risk = "high"

    row = {
        "city": city,
        "shift": shift,
        "workerType": worker_type,
        "plan": plan,
        "scenario": scenario,
    }
    return row, risk, fraud


rows = []
y_risk = []
y_fraud = []

for _ in range(1200):
    row, risk, fraud = generate_row()
    rows.append(row)
    y_risk.append(risk)
    y_fraud.append(fraud)

X = pd.DataFrame(rows)

features = ["city", "shift", "workerType", "plan", "scenario"]

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), features),
    ]
)

risk_model = Pipeline(
    steps=[
        ("prep", preprocessor),
        ("clf", DecisionTreeClassifier(max_depth=5, random_state=42)),
    ]
)

fraud_model = Pipeline(
    steps=[
        ("prep", preprocessor),
        ("clf", DecisionTreeClassifier(max_depth=4, random_state=42)),
    ]
)

risk_model.fit(X, y_risk)
fraud_model.fit(X, y_fraud)

joblib.dump(risk_model, MODEL_DIR / "risk_model.joblib")
joblib.dump(fraud_model, MODEL_DIR / "fraud_model.joblib")

print("Models trained and saved.")