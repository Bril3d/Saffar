"""
SAFAR Chain — Anomaly Detection Model Training
Trains Isolation Forest on vet + farm data
"""
import os
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

def train_vet_anomaly():
    df = pd.read_csv(os.path.join(DATA_DIR, 'vet_data.csv'))
    features = ['prescriptions_per_month', 'unique_farms', 'avg_dosage', 'reserve_class_ratio']
    X = df[features].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = IsolationForest(contamination=0.05, random_state=42, n_estimators=100)
    model.fit(X_scaled)

    joblib.dump(model, os.path.join(MODEL_DIR, 'vet_anomaly.joblib'))
    joblib.dump(scaler, os.path.join(MODEL_DIR, 'vet_scaler.joblib'))

    # Verify
    predictions = model.predict(X_scaled)
    anomalies = sum(1 for p in predictions if p == -1)
    print(f'[TRAIN] Vet anomaly model: {anomalies} anomalies detected out of {len(df)}')

def train_farm_anomaly():
    df = pd.read_csv(os.path.join(DATA_DIR, 'farm_data.csv'))
    features = ['declared_lot_size', 'sales_volume', 'volume_to_lot_ratio']
    X = df[features].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = IsolationForest(contamination=0.05, random_state=42, n_estimators=100)
    model.fit(X_scaled)

    joblib.dump(model, os.path.join(MODEL_DIR, 'farm_anomaly.joblib'))
    joblib.dump(scaler, os.path.join(MODEL_DIR, 'farm_scaler.joblib'))

    predictions = model.predict(X_scaled)
    anomalies = sum(1 for p in predictions if p == -1)
    print(f'[TRAIN] Farm anomaly model: {anomalies} anomalies detected out of {len(df)}')

if __name__ == '__main__':
    train_vet_anomaly()
    train_farm_anomaly()
    print('[TRAIN] All anomaly models trained successfully!')
