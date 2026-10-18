"""
Tests for Data Generation & Provenance Metadata
"""
import os
import json
import pandas as pd
import pytest

from scripts.generate_data import (
    generate_vet_data,
    generate_farm_data,
    generate_demand_data,
    write_provenance,
    DATA_DIR
)

def test_generate_vet_data(tmp_path):
    path, rows = generate_vet_data(seed=123, output_dir=str(tmp_path))
    assert os.path.exists(path)
    df = pd.read_csv(path)
    assert len(df) == 205
    assert set(df.columns) == {
        'vet_id', 'prescriptions_per_month', 'unique_farms', 'avg_dosage',
        'reserve_class_ratio', 'governorate', 'is_anomaly'
    }
    assert (df['is_anomaly'] == 1).sum() == 5
    assert (df['is_anomaly'] == 0).sum() == 200
    assert df.isnull().sum().sum() == 0

def test_generate_farm_data(tmp_path):
    path, rows = generate_farm_data(seed=123, output_dir=str(tmp_path))
    assert os.path.exists(path)
    df = pd.read_csv(path)
    assert len(df) == 105
    assert set(df.columns) == {
        'farmer_id', 'declared_lot_size', 'sales_volume',
        'volume_to_lot_ratio', 'governorate', 'is_anomaly'
    }
    assert (df['is_anomaly'] == 1).sum() == 5
    assert (df['is_anomaly'] == 0).sum() == 100
    assert df.isnull().sum().sum() == 0

def test_generate_demand_data(tmp_path):
    path, rows = generate_demand_data(seed=123, output_dir=str(tmp_path))
    assert os.path.exists(path)
    df = pd.read_csv(path)
    assert len(df) == 4368  # 12 governorates * 52 weeks * 7 drugs
    assert set(df.columns) == {
        'governorate', 'governorate_code', 'week', 'atc_code',
        'aware_class', 'season', 'demand'
    }
    assert df['week'].min() == 1 and df['week'].max() == 52
    assert (df['demand'] >= 0).all()
    assert df.isnull().sum().sum() == 0

def test_write_provenance(tmp_path):
    write_provenance(output_dir=str(tmp_path))
    prov_file = os.path.join(tmp_path, 'provenance.json')
    assert os.path.exists(prov_file)
    with open(prov_file) as f:
        meta = json.load(f)
    assert meta['is_real_world_data'] is False
    assert meta['provenance_type'] == 'synthetic_simulation'
    assert 'vet_data.csv' in meta['datasets']
