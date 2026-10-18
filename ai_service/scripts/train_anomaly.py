"""
SAFAR Chain — Anomaly Detection Model Training
Trains Isolation Forest on vet + farm data with proper calibration and MLflow tracking.
"""
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix

try:
    import mlflow
    MLFLOW_AVAILABLE = True
except ImportError:
    MLFLOW_AVAILABLE = False

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

def train_vet_anomaly(seed=42):
    df = pd.read_csv(os.path.join(DATA_DIR, 'vet_data.csv'))
    features = ['prescriptions_per_month', 'unique_farms', 'avg_dosage', 'reserve_class_ratio']
    X = df[features].values
    y = df['is_anomaly'].values

    # Validation split to evaluate before final fit
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.20, stratify=y, random_state=seed
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)

    # Contamination set to 0.025 (~5/205 outlier prevalence) rather than arbitrary 0.05
    contamination = 0.025
    val_model = IsolationForest(contamination=contamination, random_state=seed, n_estimators=100)
    val_model.fit(X_train_scaled)
    val_preds = (val_model.predict(X_val_scaled) == -1).astype(int)

    val_f1 = f1_score(y_val, val_preds, zero_division=0)
    val_prec = precision_score(y_val, val_preds, zero_division=0)
    val_rec = recall_score(y_val, val_preds, zero_division=0)
    print(f'[TRAIN] Vet Anomaly Validation (Hold-out 20%) -> F1: {val_f1:.4f}, Precision: {val_prec:.4f}, Recall: {val_rec:.4f}')

    # Fit final production model on full dataset
    final_scaler = StandardScaler()
    X_scaled = final_scaler.fit_transform(X)
    final_model = IsolationForest(contamination=contamination, random_state=seed, n_estimators=100)
    final_model.fit(X_scaled)

    joblib.dump(final_model, os.path.join(MODEL_DIR, 'vet_anomaly.joblib'))
    joblib.dump(final_scaler, os.path.join(MODEL_DIR, 'vet_scaler.joblib'))

    detected = int((final_model.predict(X_scaled) == -1).sum())
    print(f'[TRAIN] Vet anomaly model saved. Total dataset anomalies flagged: {detected}/{len(df)}')

    if MLFLOW_AVAILABLE:
        try:
            mlflow.set_experiment("SAFAR_Anomaly_Detection")
            with mlflow.start_run(run_name="train_vet_isolation_forest"):
                mlflow.log_params({'model': 'IsolationForest', 'domain': 'vet', 'contamination': contamination, 'n_estimators': 100})
                mlflow.log_metrics({'val_f1': val_f1, 'val_precision': val_prec, 'val_recall': val_rec, 'detected_total': detected})
        except Exception as e:
            print(f"[MLFLOW] Warning: {e}")

def train_farm_anomaly(seed=42):
    df = pd.read_csv(os.path.join(DATA_DIR, 'farm_data.csv'))
    features = ['declared_lot_size', 'sales_volume', 'volume_to_lot_ratio']
    X = df[features].values
    y = df['is_anomaly'].values

    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.20, stratify=y, random_state=seed
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)

    contamination = 0.05
    val_model = IsolationForest(contamination=contamination, random_state=seed, n_estimators=100)
    val_model.fit(X_train_scaled)
    val_preds = (val_model.predict(X_val_scaled) == -1).astype(int)

    val_f1 = f1_score(y_val, val_preds, zero_division=0)
    val_prec = precision_score(y_val, val_preds, zero_division=0)
    val_rec = recall_score(y_val, val_preds, zero_division=0)
    print(f'[TRAIN] Farm Anomaly Validation (Hold-out 20%) -> F1: {val_f1:.4f}, Precision: {val_prec:.4f}, Recall: {val_rec:.4f}')

    final_scaler = StandardScaler()
    X_scaled = final_scaler.fit_transform(X)
    final_model = IsolationForest(contamination=contamination, random_state=seed, n_estimators=100)
    final_model.fit(X_scaled)

    joblib.dump(final_model, os.path.join(MODEL_DIR, 'farm_anomaly.joblib'))
    joblib.dump(final_scaler, os.path.join(MODEL_DIR, 'farm_scaler.joblib'))

    detected = int((final_model.predict(X_scaled) == -1).sum())
    print(f'[TRAIN] Farm anomaly model saved. Total dataset anomalies flagged: {detected}/{len(df)}')

    if MLFLOW_AVAILABLE:
        try:
            mlflow.set_experiment("SAFAR_Anomaly_Detection")
            with mlflow.start_run(run_name="train_farm_isolation_forest"):
                mlflow.log_params({'model': 'IsolationForest', 'domain': 'farm', 'contamination': contamination, 'n_estimators': 100})
                mlflow.log_metrics({'val_f1': val_f1, 'val_precision': val_prec, 'val_recall': val_rec, 'detected_total': detected})
        except Exception as e:
            print(f"[MLFLOW] Warning: {e}")

if __name__ == '__main__':
    train_vet_anomaly()
    train_farm_anomaly()
    print('[TRAIN] All anomaly models trained and serialized successfully!')
