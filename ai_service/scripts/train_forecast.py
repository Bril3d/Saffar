"""
SAFAR Chain — Demand Forecast Model Training
Trains production XGBoost regressor on weekly antibiotic demand using zero-leakage
cyclical seasonal and autoregressive lag features with MLflow tracking.
"""
import os
import joblib
import pandas as pd
from xgboost import XGBRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np

from features import (
    build_features,
    FEATURE_COLS,
    ATC_CODES
)

try:
    import mlflow
    MLFLOW_AVAILABLE = True
except ImportError:
    MLFLOW_AVAILABLE = False

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

def train_forecast(seed=42):
    demand_path = os.path.join(DATA_DIR, 'demand_data.csv')
    df = pd.read_csv(demand_path)

    # Chronological validation holdout
    train_raw = df[df['week'] <= 40].copy()
    val_raw = df[df['week'] > 40].copy()

    train_feat, feat_cols, train_stats = build_features(train_raw, is_train=True)
    val_feat, _, _ = build_features(val_raw, history_df=train_raw, train_stats=train_stats, is_train=False)

    X_train, y_train = train_feat[feat_cols].values, train_feat['demand'].values
    X_val, y_val = val_feat[feat_cols].values, val_feat['demand'].values

    # Validation fit
    val_xgb = XGBRegressor(n_estimators=100, max_depth=5, learning_rate=0.08, random_state=seed)
    val_xgb.fit(X_train, y_train)
    val_preds = val_xgb.predict(X_val)

    val_mae = mean_absolute_error(y_val, val_preds)
    val_rmse = np.sqrt(mean_squared_error(y_val, val_preds))
    val_r2 = r2_score(y_val, val_preds)
    print(f'[TRAIN] Demand Forecast Validation (Weeks 41-52 Holdout) -> MAE: {val_mae:.2f}, RMSE: {val_rmse:.2f}, R2: {val_r2:.4f}')

    # Train production model on full dataset
    full_feat, _, full_stats = build_features(df, is_train=True)
    X_full, y_full = full_feat[feat_cols].values, full_feat['demand'].values

    prod_xgb = XGBRegressor(n_estimators=100, max_depth=5, learning_rate=0.08, random_state=seed)
    prod_xgb.fit(X_full, y_full)

    # Save models and metadata
    joblib.dump(prod_xgb, os.path.join(MODEL_DIR, 'demand_forecast.joblib'))
    
    # Metadata for inference lag reconstruction
    metadata = {
        'feature_cols': feat_cols,
        'train_stats': full_stats,
        'val_metrics': {'mae': float(val_mae), 'rmse': float(val_rmse), 'r2': float(val_r2)},
        'atc_codes': ATC_CODES
    }
    joblib.dump(metadata, os.path.join(MODEL_DIR, 'forecast_metadata.joblib'))

    # Keep backward-compatible label encoder artifact
    le_atc = LabelEncoder()
    le_atc.fit(ATC_CODES)
    joblib.dump(le_atc, os.path.join(MODEL_DIR, 'atc_encoder.joblib'))

    print(f'[TRAIN] Production XGBoost model and metadata saved to {MODEL_DIR}')

    if MLFLOW_AVAILABLE:
        try:
            mlflow.set_experiment("SAFAR_Demand_Forecasting")
            with mlflow.start_run(run_name="train_production_xgboost"):
                mlflow.log_params({
                    'model': 'XGBRegressor',
                    'n_estimators': 100,
                    'max_depth': 5,
                    'learning_rate': 0.08,
                    'features': ','.join(feat_cols)
                })
                mlflow.log_metrics({
                    'val_mae': float(val_mae),
                    'val_rmse': float(val_rmse),
                    'val_r2': float(val_r2)
                })
                mlflow.log_artifact(os.path.join(MODEL_DIR, 'demand_forecast.joblib'))
        except Exception as e:
            print(f"[MLFLOW] Warning: {e}")

if __name__ == '__main__':
    train_forecast()
    print('[TRAIN] Forecast model trained and serialized successfully!')
