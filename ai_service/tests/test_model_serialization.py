"""
Tests for Model Artifact Serialization & Deserialization
"""
import os
import joblib
import numpy as np
import pytest

from main import MODEL_DIR

def test_anomaly_model_artifacts_load():
    vet_model_path = os.path.join(MODEL_DIR, 'vet_anomaly.joblib')
    vet_scaler_path = os.path.join(MODEL_DIR, 'vet_scaler.joblib')
    farm_model_path = os.path.join(MODEL_DIR, 'farm_anomaly.joblib')
    farm_scaler_path = os.path.join(MODEL_DIR, 'farm_scaler.joblib')

    assert os.path.exists(vet_model_path)
    assert os.path.exists(vet_scaler_path)
    assert os.path.exists(farm_model_path)
    assert os.path.exists(farm_scaler_path)

    vet_model = joblib.load(vet_model_path)
    vet_scaler = joblib.load(vet_scaler_path)

    dummy_vet_x = np.array([[28.0, 12.0, 50.0, 0.04]])
    scaled = vet_scaler.transform(dummy_vet_x)
    pred = vet_model.predict(scaled)
    score = vet_model.decision_function(scaled)
    assert pred[0] in [1, -1]
    assert isinstance(float(score[0]), float)

def test_forecast_model_artifacts_load():
    forecast_model_path = os.path.join(MODEL_DIR, 'demand_forecast.joblib')
    meta_path = os.path.join(MODEL_DIR, 'forecast_metadata.joblib')

    assert os.path.exists(forecast_model_path)
    assert os.path.exists(meta_path)

    model = joblib.load(forecast_model_path)
    meta = joblib.load(meta_path)

    assert 'feature_cols' in meta
    assert 'train_stats' in meta

    dummy_input = np.ones((1, len(meta['feature_cols'])))
    pred = model.predict(dummy_input)
    assert len(pred) == 1
    assert isinstance(float(pred[0]), float)
