"""
Tests for FastAPI Service Endpoints & Integration
"""
import pytest
from fastapi.testclient import TestClient

from main import app, load_models

@pytest.fixture(scope="module")
def client():
    load_models()
    return TestClient(app)

def test_health_endpoint(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "vet_anomaly" in data["models_loaded"]
    assert "forecast" in data["models_loaded"]

def test_vet_anomaly_endpoint(client):
    # Test Normal Vet
    res_normal = client.get("/ai/anomaly/vet/VET-001")
    assert res_normal.status_code == 200
    data_norm = res_normal.json()
    assert data_norm["vetId"] == "VET-001"
    assert "isAnomaly" in data_norm
    assert "anomalyScore" in data_norm
    assert "details" in data_norm

    # Test Injected Outlier Vet
    res_outlier = client.get("/ai/anomaly/vet/VET-201")
    assert res_outlier.status_code == 200
    data_out = res_outlier.json()
    assert data_out["vetId"] == "VET-201"
    assert data_out["isAnomaly"] is True

    # Test 404 Unknown Vet
    res_404 = client.get("/ai/anomaly/vet/VET-NONEXISTENT")
    assert res_404.status_code == 404

def test_farm_anomaly_endpoint(client):
    # Test Normal Farm
    res_normal = client.get("/ai/anomaly/farm/FARM-001")
    assert res_normal.status_code == 200
    data_norm = res_normal.json()
    assert data_norm["farmerId"] == "FARM-001"
    assert "isAnomaly" in data_norm
    assert "declaredLotSize" in data_norm["details"]

    # Test Injected Fraud Farm
    res_fraud = client.get("/ai/anomaly/farm/FARM-101")
    assert res_fraud.status_code == 200
    data_fraud = res_fraud.json()
    assert data_fraud["farmerId"] == "FARM-101"
    assert data_fraud["isAnomaly"] is True

    # Test 404 Unknown Farm
    res_404 = client.get("/ai/anomaly/farm/FARM-NONEXISTENT")
    assert res_404.status_code == 404

def test_forecast_endpoint(client):
    # Test valid governorate default week
    res = client.get("/ai/forecast/Tunis")
    assert res.status_code == 200
    data = res.json()
    assert data["governorate"] == "Tunis"
    assert "week" in data
    assert "season" in data
    assert len(data["predictions"]) == 7
    for item in data["predictions"]:
        assert "atcCode" in item
        assert "awareClass" in item
        assert "predictedDemand" in item
        assert "trend" in item

    # Test custom target week query param
    res_custom = client.get("/ai/forecast/Ariana?week=35")
    assert res_custom.status_code == 200
    data_custom = res_custom.json()
    assert data_custom["week"] == 35
    assert data_custom["season"] == "Summer"

    # Test 404 Unknown governorate
    res_404 = client.get("/ai/forecast/InvalidGovernorate")
    assert res_404.status_code == 404
