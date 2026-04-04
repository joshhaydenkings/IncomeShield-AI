from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.tree import DecisionTreeRegressor

MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

rows = [
    {"city": "Chennai", "zone": "Tambaram", "shift": "6 PM - 11 PM", "workerType": "Food Delivery", "plan": "Lite", "scenario": "normal", "premium": 30},
    {"city": "Chennai", "zone": "Tambaram", "shift": "6 PM - 11 PM", "workerType": "Food Delivery", "plan": "Lite", "scenario": "rain", "premium": 33},
    {"city": "Chennai", "zone": "Tambaram", "shift": "6 PM - 11 PM", "workerType": "Food Delivery", "plan": "Lite", "scenario": "flood", "premium": 37},
    {"city": "Chennai", "zone": "Tambaram", "shift": "6 PM - 11 PM", "workerType": "Food Delivery", "plan": "Core", "scenario": "normal", "premium": 40},
    {"city": "Chennai", "zone": "Tambaram", "shift": "6 PM - 11 PM", "workerType": "Food Delivery", "plan": "Core", "scenario": "rain", "premium": 44},
    {"city": "Chennai", "zone": "Tambaram", "shift": "6 PM - 11 PM", "workerType": "Food Delivery", "plan": "Core", "scenario": "flood", "premium": 48},
    {"city": "Chennai", "zone": "Velachery", "shift": "4 PM - 9 PM", "workerType": "Parcel Delivery", "plan": "Lite", "scenario": "normal", "premium": 31},
    {"city": "Chennai", "zone": "Velachery", "shift": "4 PM - 9 PM", "workerType": "Parcel Delivery", "plan": "Core", "scenario": "rain", "premium": 45},
    {"city": "Chennai", "zone": "Potheri", "shift": "11 AM - 4 PM", "workerType": "Grocery / Quick Commerce", "plan": "Lite", "scenario": "normal", "premium": 30},
    {"city": "Chennai", "zone": "Potheri", "shift": "11 AM - 4 PM", "workerType": "Grocery / Quick Commerce", "plan": "Core", "scenario": "rain", "premium": 43},
    {"city": "Mumbai", "zone": "Andheri", "shift": "6 PM - 11 PM", "workerType": "Ride Share", "plan": "Lite", "scenario": "normal", "premium": 34},
    {"city": "Mumbai", "zone": "Andheri", "shift": "6 PM - 11 PM", "workerType": "Ride Share", "plan": "Core", "scenario": "rain", "premium": 47},
    {"city": "Mumbai", "zone": "Andheri", "shift": "6 PM - 11 PM", "workerType": "Ride Share", "plan": "Shield+", "scenario": "flood", "premium": 65},
    {"city": "Delhi", "zone": "Dwarka", "shift": "4 PM - 9 PM", "workerType": "Parcel Delivery", "plan": "Core", "scenario": "aqi", "premium": 46},
    {"city": "Delhi", "zone": "Dwarka", "shift": "4 PM - 9 PM", "workerType": "Parcel Delivery", "plan": "Shield+", "scenario": "aqi", "premium": 61},
    {"city": "Bengaluru", "zone": "Whitefield", "shift": "11 AM - 4 PM", "workerType": "Food Delivery", "plan": "Lite", "scenario": "normal", "premium": 28},
    {"city": "Bengaluru", "zone": "Whitefield", "shift": "11 AM - 4 PM", "workerType": "Food Delivery", "plan": "Core", "scenario": "outage", "premium": 42},
    {"city": "Hyderabad", "zone": "Gachibowli", "shift": "4 PM - 9 PM", "workerType": "Parcel Delivery", "plan": "Lite", "scenario": "outage", "premium": 34},
    {"city": "Hyderabad", "zone": "Gachibowli", "shift": "4 PM - 9 PM", "workerType": "Parcel Delivery", "plan": "Shield+", "scenario": "normal", "premium": 58},
    {"city": "Itanagar", "zone": "Naharlagun", "shift": "6 AM - 11 AM", "workerType": "Food Delivery", "plan": "Lite", "scenario": "normal", "premium": 26},
    {"city": "Itanagar", "zone": "Naharlagun", "shift": "6 AM - 11 AM", "workerType": "Food Delivery", "plan": "Core", "scenario": "rain", "premium": 39},
    {"city": "Itanagar", "zone": "Naharlagun", "shift": "6 AM - 11 AM", "workerType": "Food Delivery", "plan": "Shield+", "scenario": "flood", "premium": 61},
    {"city": "Chennai", "zone": "Tambaram", "shift": "6 PM - 11 PM", "workerType": "Ride Share", "plan": "Shield+", "scenario": "gps_spoof", "premium": 63},
    {"city": "Mumbai", "zone": "Bandra", "shift": "4 PM - 9 PM", "workerType": "Food Delivery", "plan": "Core", "scenario": "normal", "premium": 42},
    {"city": "Mumbai", "zone": "Bandra", "shift": "4 PM - 9 PM", "workerType": "Food Delivery", "plan": "Core", "scenario": "rain", "premium": 46},
    {"city": "Delhi", "zone": "Saket", "shift": "6 PM - 11 PM", "workerType": "Ride Share", "plan": "Lite", "scenario": "aqi", "premium": 37},
    {"city": "Bengaluru", "zone": "Indiranagar", "shift": "11 AM - 4 PM", "workerType": "Grocery / Quick Commerce", "plan": "Core", "scenario": "normal", "premium": 40},
]

df = pd.DataFrame(rows)

X = df[["city", "zone", "shift", "workerType", "plan", "scenario"]]
y = df["premium"]

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
        ("reg", DecisionTreeRegressor(max_depth=6, random_state=42)),
    ]
)

model.fit(X, y)

joblib.dump(model, MODEL_DIR / "pricing_model.joblib")
print("Pricing model trained and saved.")