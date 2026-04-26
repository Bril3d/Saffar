"""
SAFAR Chain — AI Service (FastAPI)
Layer 1: Anomaly Detection (Isolation Forest) + Demand Forecasting (XGBoost)
"""
import os
import pandas as pd
import numpy as np
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SAFAR AI Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, 'models')
DATA_DIR = os.path.join(BASE_DIR, 'data')

# Load models at startup
models = {}

def load_models():
    try:
        models['vet_anomaly'] = joblib.load(os.path.join(MODEL_DIR, 'vet_anomaly.joblib'))
        models['vet_scaler'] = joblib.load(os.path.join(MODEL_DIR, 'vet_scaler.joblib'))
        models['farm_anomaly'] = joblib.load(os.path.join(MODEL_DIR, 'farm_anomaly.joblib'))
        models['farm_scaler'] = joblib.load(os.path.join(MODEL_DIR, 'farm_scaler.joblib'))
        models['forecast'] = joblib.load(os.path.join(MODEL_DIR, 'demand_forecast.joblib'))
        models['atc_encoder'] = joblib.load(os.path.join(MODEL_DIR, 'atc_encoder.joblib'))
        print("[AI] All models loaded successfully")
    except Exception as e:
        print(f"[AI] Warning: Could not load models: {e}")
        print("[AI] Run generate_data.py and train scripts first!")

@app.on_event("startup")
async def startup():
    load_models()

@app.get("/health")
def health():
    loaded = list(models.keys())
    return {"status": "healthy", "models_loaded": loaded, "count": len(loaded)}

# ---- Vet Anomaly Detection ----
@app.get("/ai/anomaly/vet/{vet_id}")
def vet_anomaly(vet_id: str):
    if 'vet_anomaly' not in models:
        raise HTTPException(503, "Anomaly model not loaded")

    df = pd.read_csv(os.path.join(DATA_DIR, 'vet_data.csv'))
    vet = df[df['vet_id'] == vet_id]

    if vet.empty:
        # If vet not in training data, create a sample from median values
        raise HTTPException(404, f"Vet {vet_id} not found in dataset")

    features = ['prescriptions_per_month', 'unique_farms', 'avg_dosage', 'reserve_class_ratio']
    X = vet[features].values
    X_scaled = models['vet_scaler'].transform(X)

    score = models['vet_anomaly'].decision_function(X_scaled)[0]
    prediction = models['vet_anomaly'].predict(X_scaled)[0]
    is_anomaly = prediction == -1

    # Compute median for comparison
    median_rx = df['prescriptions_per_month'].median()

    return {
        "vetId": vet_id,
        "anomalyScore": round(float(score), 4),
        "isAnomaly": is_anomaly,
        "details": {
            "prescriptionsPerMonth": int(vet.iloc[0]['prescriptions_per_month']),
            "medianPrescriptions": int(median_rx),
            "ratio": round(float(vet.iloc[0]['prescriptions_per_month'] / median_rx), 2),
            "uniqueFarms": int(vet.iloc[0]['unique_farms']),
            "reserveClassRatio": float(vet.iloc[0]['reserve_class_ratio'])
        },
        "recommendation": "ALERT: Prescribing pattern anomaly detected. Review recommended." if is_anomaly
                          else "Normal prescribing pattern."
    }

# ---- Farm Anomaly Detection ----
@app.get("/ai/anomaly/farm/{farmer_id}")
def farm_anomaly(farmer_id: str):
    if 'farm_anomaly' not in models:
        raise HTTPException(503, "Anomaly model not loaded")

    df = pd.read_csv(os.path.join(DATA_DIR, 'farm_data.csv'))
    farm = df[df['farmer_id'] == farmer_id]

    if farm.empty:
        raise HTTPException(404, f"Farm {farmer_id} not found in dataset")

    features = ['declared_lot_size', 'sales_volume', 'volume_to_lot_ratio']
    X = farm[features].values
    X_scaled = models['farm_scaler'].transform(X)

    score = models['farm_anomaly'].decision_function(X_scaled)[0]
    prediction = models['farm_anomaly'].predict(X_scaled)[0]
    is_anomaly = prediction == -1

    return {
        "farmerId": farmer_id,
        "anomalyScore": round(float(score), 4),
        "isAnomaly": is_anomaly,
        "details": {
            "declaredLotSize": int(farm.iloc[0]['declared_lot_size']),
            "salesVolume": int(farm.iloc[0]['sales_volume']),
            "volumeToLotRatio": float(farm.iloc[0]['volume_to_lot_ratio'])
        },
        "recommendation": "ALERT: Sales volume inconsistent with declared lot size. Possible fraud." if is_anomaly
                          else "Sales volume consistent with declared lot size."
    }

# ---- Demand Forecast ----
GOVERNORATE_MAP = {
    'Tunis': 0, 'Ariana': 1, 'Ben_Arous': 2, 'Manouba': 3, 'Nabeul': 4, 'Zaghouan': 5,
    'Bizerte': 6, 'Beja': 7, 'Jendouba': 8, 'Kef': 9, 'Siliana': 10, 'Sousse': 11
}

ATC_CODES = ['J01CA04', 'J01CE01', 'J01DB01', 'J01AA07', 'J01FA01', 'J01CR02', 'J01XB01']
AWARE_MAP = {'J01CA04': 'Access', 'J01CE01': 'Access', 'J01DB01': 'Access',
             'J01AA07': 'Watch', 'J01FA01': 'Watch', 'J01CR02': 'Watch', 'J01XB01': 'Reserve'}

@app.get("/ai/forecast/{governorate}")
def forecast(governorate: str):
    if 'forecast' not in models:
        raise HTTPException(503, "Forecast model not loaded")

    gov_code = GOVERNORATE_MAP.get(governorate)
    if gov_code is None:
        raise HTTPException(404, f"Unknown governorate: {governorate}. Valid: {list(GOVERNORATE_MAP.keys())}")

    # Predict next week (week 53 or current+1)
    current_week = 20  # Simulated
    next_week = current_week + 1
    season = 0 if next_week <= 13 else (1 if next_week <= 26 else (2 if next_week <= 39 else 3))

    predictions = []
    for atc in ATC_CODES:
        try:
            atc_encoded = models['atc_encoder'].transform([atc])[0]
        except ValueError:
            continue
        X = np.array([[gov_code, next_week, atc_encoded, season]])
        pred = models['forecast'].predict(X)[0]

        trend = "stable"
        if pred > 150: trend = "increasing"
        elif pred < 50: trend = "decreasing"

        recommendations = []
        if AWARE_MAP[atc] == 'Reserve' and pred > 20:
            recommendations.append("WARNING: High demand for Reserve-class antibiotic")
        if trend == "increasing":
            recommendations.append("Consider increasing stock")

        predictions.append({
            "atcCode": atc,
            "awareClass": AWARE_MAP[atc],
            "predictedDemand": round(float(pred), 1),
            "trend": trend,
            "recommendation": "; ".join(recommendations) if recommendations else "Normal demand expected"
        })

    return {
        "governorate": governorate,
        "week": next_week,
        "season": ["Winter", "Spring", "Summer", "Autumn"][season],
        "predictions": predictions
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
