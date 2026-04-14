from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

rows = [
    {"city": "Chennai", "zone": "Tambaram", "shift": "6 PM - 11 PM", "workerType": "Food Delivery", "plan": "Lite", "scenario": "normal", "risk_score": 72},
    {"city": "Chennai", "zone": "Tambaram", "shift": "6 PM - 11 PM", "workerType": "Food Delivery", "plan": "Lite", "scenario": "rain", "risk_score": 48},
    {"city": "Chennai", "zone": "Tambaram", "shift": "6 PM - 11 PM", "workerType": "Food Delivery", "plan": "Lite", "scenario": "flood", "risk_score": 14},
    {"city": "Chennai", "zone": "Tambaram", "shift": "6 PM - 11 PM", "workerType": "Food Delivery", "plan": "Core", "scenario": "normal", "risk_score": 76},
    {"city": "Chennai", "zone": "Tambaram", "shift": "6 PM - 11 PM", "workerType": "Food Delivery", "plan": "Core", "scenario": "rain", "risk_score": 50},
    {"city": "Chennai", "zone": "Tambaram", "shift": "6 PM - 11 PM", "workerType": "Food Delivery", "plan": "Core", "scenario": "flood", "risk_score": 16},
    {"city": "Chennai", "zone": "Velachery", "shift": "4 PM - 9 PM", "workerType": "Parcel Delivery", "plan": "Core", "scenario": "rain", "risk_score": 55},
    {"city": "Chennai", "zone": "Potheri", "shift": "11 AM - 4 PM", "workerType": "Grocery / Quick Commerce", "plan": "Lite", "scenario": "normal", "risk_score": 67},
    {"city": "Chennai", "zone": "Potheri", "shift": "11 AM - 4 PM", "workerType": "Grocery / Quick Commerce", "plan": "Lite", "scenario": "outage", "risk_score": 44},
    {"city": "Mumbai", "zone": "Andheri", "shift": "6 PM - 11 PM", "workerType": "Ride Share", "plan": "Lite", "scenario": "normal", "risk_score": 60},
    {"city": "Mumbai", "zone": "Andheri", "shift": "6 PM - 11 PM", "workerType": "Ride Share", "plan": "Lite", "scenario": "rain", "risk_score": 43},
    {"city": "Mumbai", "zone": "Andheri", "shift": "6 PM - 11 PM", "workerType": "Ride Share", "plan": "Shield+", "scenario": "flood", "risk_score": 12},
    {"city": "Delhi", "zone": "Dwarka", "shift": "4 PM - 9 PM", "workerType": "Parcel Delivery", "plan": "Core", "scenario": "aqi", "risk_score": 22},
    {"city": "Delhi", "zone": "Saket", "shift": "6 PM - 11 PM", "workerType": "Ride Share", "plan": "Lite", "scenario": "aqi", "risk_score": 20},
    {"city": "Bengaluru", "zone": "Whitefield", "shift": "11 AM - 4 PM", "workerType": "Food Delivery", "plan": "Lite", "scenario": "normal", "risk_score": 83},
    {"city": "Bengaluru", "zone": "Whitefield", "shift": "11 AM - 4 PM", "workerType": "Food Delivery", "plan": "Core", "scenario": "outage", "risk_score": 58},
    {"city": "Hyderabad", "zone": "Gachibowli", "shift": "4 PM - 9 PM", "workerType": "Parcel Delivery", "plan": "Lite", "scenario": "outage", "risk_score": 52},
    {"city": "Hyderabad", "zone": "Gachibowli", "shift": "4 PM - 9 PM", "workerType": "Parcel Delivery", "plan": "Shield+", "scenario": "normal", "risk_score": 74},
    {"city": "Itanagar", "zone": "Naharlagun", "shift": "6 AM - 11 AM", "workerType": "Food Delivery", "plan": "Lite", "scenario": "normal", "risk_score": 90},
    {"city": "Itanagar", "zone": "Naharlagun", "shift": "6 AM - 11 AM", "workerType": "Food Delivery", "plan": "Core", "scenario": "rain", "risk_score": 63},
    {"city": "Itanagar", "zone": "Naharlagun", "shift": "6 AM - 11 AM", "workerType": "Food Delivery", "plan": "Shield+", "scenario": "flood", "risk_score": 21},
    {"city": "Chennai", "zone": "Tambaram", "shift": "6 PM - 11 PM", "workerType": "Ride Share", "plan": "Shield+", "scenario": "gps_spoof", "risk_score": 28},
    {"city": "Mumbai", "zone": "Bandra", "shift": "4 PM - 9 PM", "workerType": "Food Delivery", "plan": "Core", "scenario": "normal", "risk_score": 69},
    {"city": "Mumbai", "zone": "Bandra", "shift": "4 PM - 9 PM", "workerType": "Food Delivery", "plan": "Core", "scenario": "rain", "risk_score": 49},
    {"city": "Delhi", "zone": "Dwarka", "shift": "11 AM - 4 PM", "workerType": "Food Delivery", "plan": "Lite", "scenario": "normal", "risk_score": 78},
    {"city": "Delhi", "zone": "Dwarka", "shift": "11 AM - 4 PM", "workerType": "Food Delivery", "plan": "Lite", "scenario": "aqi", "risk_score": 29},
    {"city": "Chennai", "zone": "Velachery", "shift": "6 AM - 11 AM", "workerType": "Food Delivery", "plan": "Core", "scenario": "normal", "risk_score": 88},
    {"city": "Chennai", "zone": "Velachery", "shift": "6 AM - 11 AM", "workerType": "Food Delivery", "plan": "Core", "scenario": "rain", "risk_score": 61},
    {"city": "Hyderabad", "zone": "Madhapur", "shift": "6 PM - 11 PM", "workerType": "Ride Share", "plan": "Core", "scenario": "normal", "risk_score": 66},
    {"city": "Hyderabad", "zone": "Madhapur", "shift": "6 PM - 11 PM", "workerType": "Ride Share", "plan": "Core", "scenario": "outage", "risk_score": 40},
]

df = pd.DataFrame(rows)

X = df[["city", "zone", "shift", "workerType", "plan", "scenario"]]
y = df["risk_score"]

preprocessor = ColumnTransformer(
    transformers=[
        (
            "cat",
            OneHotEncoder(handle_unknown="ignore"),
            ["city", "zone", "shift", "workerType", "plan", "scenario"],
        )
    ]
)

model = Pipeline(
    steps=[
        ("prep", preprocessor),
        ("reg", RandomForestRegressor(n_estimators=150, random_state=42)),
    ]
)

model.fit(X, y)

bundle = {
    "model": model,
    "feature_columns": ["city", "zone", "shift", "workerType", "plan", "scenario"],
    "trained_at": pd.Timestamp.utcnow().isoformat(),
    "model_type": "RandomForestRegressor",
}

joblib.dump(bundle, MODEL_DIR / "risk_model.joblib")
print("Risk model trained and saved.")
