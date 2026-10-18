"""
SAFAR Chain — Synthetic Data Generator
Generates reproducible simulation data for Isolation Forest anomaly detection + XGBoost forecasting.

NOTE: This is synthetic benchmark/prototype data. All distributions, outliers, and demand values
are generated algorithmically with a fixed pseudo-random seed. They do NOT represent real clinical,
veterinary, or commercial records.
"""
import csv
import json
import os
import random
import math
from datetime import datetime, timezone

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
os.makedirs(DATA_DIR, exist_ok=True)

# ---- Tunisian Governorates ----
GOVERNORATES = ['Tunis', 'Ariana', 'Ben_Arous', 'Manouba', 'Nabeul', 'Zaghouan',
                'Bizerte', 'Beja', 'Jendouba', 'Kef', 'Siliana', 'Sousse']

ATC_CODES = ['J01CA04', 'J01CE01', 'J01DB01', 'J01AA07', 'J01FA01', 'J01CR02', 'J01XB01']
AWARE_CLASSES = {'J01CA04': 'Access', 'J01CE01': 'Access', 'J01DB01': 'Access',
                 'J01AA07': 'Watch', 'J01FA01': 'Watch', 'J01CR02': 'Watch', 'J01XB01': 'Reserve'}

def generate_vet_data(seed=42, output_dir=DATA_DIR):
    """
    Generates 200 normal vets + 5 injected outlier vets (synthetic labels).
    Outliers simulate over-prescribing behavior and abnormal reserve drug proportions.
    """
    rng = random.Random(seed)
    rows = []
    # Normal vets
    for i in range(200):
        rows.append({
            'vet_id': f'VET-{i+1:03d}',
            'prescriptions_per_month': max(1, int(rng.gauss(28, 8))),
            'unique_farms': max(1, int(rng.gauss(12, 4))),
            'avg_dosage': round(rng.gauss(50, 10), 1),
            'reserve_class_ratio': round(rng.uniform(0, 0.08), 3),
            'governorate': rng.choice(GOVERNORATES),
            'is_anomaly': 0
        })
    # Outlier vets (over-prescribers)
    for i in range(5):
        rows.append({
            'vet_id': f'VET-{201+i:03d}',
            'prescriptions_per_month': rng.randint(120, 180),
            'unique_farms': rng.randint(2, 5),
            'avg_dosage': round(rng.gauss(90, 15), 1),
            'reserve_class_ratio': round(rng.uniform(0.25, 0.5), 3),
            'governorate': rng.choice(GOVERNORATES),
            'is_anomaly': 1
        })

    path = os.path.join(output_dir, 'vet_data.csv')
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)
    print(f'[DATA] Generated {len(rows)} vets -> {path}')
    return path, rows

def generate_farm_data(seed=42, output_dir=DATA_DIR):
    """
    Generates 100 normal farms + 5 fraud farms (synthetic labels).
    Fraud farms simulate selling significantly more volume than declared herd capacity.
    """
    rng = random.Random(seed)
    rows = []
    for i in range(100):
        lot_size = rng.randint(200, 5000)
        sales = int(lot_size * rng.uniform(0.8, 1.2))
        rows.append({
            'farmer_id': f'FARM-{i+1:03d}',
            'declared_lot_size': lot_size,
            'sales_volume': sales,
            'volume_to_lot_ratio': round(sales / lot_size, 3),
            'governorate': rng.choice(GOVERNORATES),
            'is_anomaly': 0
        })
    # Fraud farms: selling way more than declared
    for i in range(5):
        lot_size = rng.randint(200, 1000)
        sales = int(lot_size * rng.uniform(3, 5))
        rows.append({
            'farmer_id': f'FARM-{101+i:03d}',
            'declared_lot_size': lot_size,
            'sales_volume': sales,
            'volume_to_lot_ratio': round(sales / lot_size, 3),
            'governorate': rng.choice(GOVERNORATES),
            'is_anomaly': 1
        })

    path = os.path.join(output_dir, 'farm_data.csv')
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)
    print(f'[DATA] Generated {len(rows)} farms -> {path}')
    return path, rows

def generate_demand_data(seed=42, output_dir=DATA_DIR):
    """
    Generates weekly antibiotic demand per governorate (52 weeks x 12 governorates x 7 ATC codes = 4,368 records).
    Demand follows a seasonal sinusoidal pattern with Gaussian noise.
    """
    rng = random.Random(seed)
    rows = []
    for gov_idx, gov in enumerate(GOVERNORATES):
        for week in range(1, 53):
            for atc in ATC_CODES:
                season = 0 if week <= 13 else (1 if week <= 26 else (2 if week <= 39 else 3))
                base = rng.randint(50, 200)
                # Seasonal sinusoidal variation
                seasonal_mult = 1.0 + 0.3 * math.sin(2 * math.pi * week / 52)
                # Reserve drugs have lower demand
                if AWARE_CLASSES[atc] == 'Reserve':
                    base = int(base * 0.1)
                demand = max(0, int(base * seasonal_mult + rng.gauss(0, 10)))
                rows.append({
                    'governorate': gov,
                    'governorate_code': gov_idx,
                    'week': week,
                    'atc_code': atc,
                    'aware_class': AWARE_CLASSES[atc],
                    'season': season,
                    'demand': demand
                })

    path = os.path.join(output_dir, 'demand_data.csv')
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)
    print(f'[DATA] Generated {len(rows)} demand records -> {path}')
    return path, rows

def write_provenance(output_dir=DATA_DIR):
    provenance = {
        'version': '1.0.0',
        'generated_at_utc': datetime.now(timezone.utc).isoformat(),
        'random_seed': 42,
        'provenance_type': 'synthetic_simulation',
        'is_real_world_data': False,
        'description': (
            'Algorithmic simulation of Tunisian agricultural veterinary compliance and antibiotic demand. '
            'Created solely for prototype demonstration and pipeline benchmarking. '
            'DO NOT cite these labels as clinical gold standards.'
        ),
        'datasets': {
            'vet_data.csv': {'rows': 205, 'normal': 200, 'injected_outliers': 5, 'outlier_rate': 0.0244},
            'farm_data.csv': {'rows': 105, 'normal': 100, 'injected_outliers': 5, 'outlier_rate': 0.0476},
            'demand_data.csv': {'rows': 4368, 'weeks': 52, 'governorates': 12, 'drugs': 7}
        }
    }
    path = os.path.join(output_dir, 'provenance.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(provenance, f, indent=2)
    print(f'[DATA] Provenance metadata saved -> {path}')

if __name__ == '__main__':
    generate_vet_data()
    generate_farm_data()
    generate_demand_data()
    write_provenance()
    print('[DATA] All synthetic datasets and provenance generated successfully!')
