"""
SAFAR Chain — Synthetic Data Generator
Generates realistic data for Isolation Forest anomaly detection + XGBoost forecasting.
"""
import csv
import os
import random
import math

random.seed(42)
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
os.makedirs(DATA_DIR, exist_ok=True)

# ---- Tunisian Governorates ----
GOVERNORATES = ['Tunis', 'Ariana', 'Ben_Arous', 'Manouba', 'Nabeul', 'Zaghouan',
                'Bizerte', 'Beja', 'Jendouba', 'Kef', 'Siliana', 'Sousse']

ATC_CODES = ['J01CA04', 'J01CE01', 'J01DB01', 'J01AA07', 'J01FA01', 'J01CR02', 'J01XB01']
AWARE_CLASSES = {'J01CA04': 'Access', 'J01CE01': 'Access', 'J01DB01': 'Access',
                 'J01AA07': 'Watch', 'J01FA01': 'Watch', 'J01CR02': 'Watch', 'J01XB01': 'Reserve'}

def generate_vet_data():
    """200 normal vets + 5 outlier vets"""
    rows = []
    # Normal vets
    for i in range(200):
        rows.append({
            'vet_id': f'VET-{i+1:03d}',
            'prescriptions_per_month': max(1, int(random.gauss(28, 8))),
            'unique_farms': max(1, int(random.gauss(12, 4))),
            'avg_dosage': round(random.gauss(50, 10), 1),
            'reserve_class_ratio': round(random.uniform(0, 0.08), 3),
            'governorate': random.choice(GOVERNORATES),
            'is_anomaly': 0
        })
    # Outlier vets (over-prescribers)
    for i in range(5):
        rows.append({
            'vet_id': f'VET-{201+i:03d}',
            'prescriptions_per_month': random.randint(120, 180),
            'unique_farms': random.randint(2, 5),
            'avg_dosage': round(random.gauss(90, 15), 1),
            'reserve_class_ratio': round(random.uniform(0.25, 0.5), 3),
            'governorate': random.choice(GOVERNORATES),
            'is_anomaly': 1
        })

    path = os.path.join(DATA_DIR, 'vet_data.csv')
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)
    print(f'[DATA] Generated {len(rows)} vets -> {path}')

def generate_farm_data():
    """100 normal farms + 5 fraud farms"""
    rows = []
    for i in range(100):
        lot_size = random.randint(200, 5000)
        sales = int(lot_size * random.uniform(0.8, 1.2))
        rows.append({
            'farmer_id': f'FARM-{i+1:03d}',
            'declared_lot_size': lot_size,
            'sales_volume': sales,
            'volume_to_lot_ratio': round(sales / lot_size, 3),
            'governorate': random.choice(GOVERNORATES),
            'is_anomaly': 0
        })
    # Fraud farms: selling way more than declared
    for i in range(5):
        lot_size = random.randint(200, 1000)
        sales = int(lot_size * random.uniform(3, 5))
        rows.append({
            'farmer_id': f'FARM-{101+i:03d}',
            'declared_lot_size': lot_size,
            'sales_volume': sales,
            'volume_to_lot_ratio': round(sales / lot_size, 3),
            'governorate': random.choice(GOVERNORATES),
            'is_anomaly': 1
        })

    path = os.path.join(DATA_DIR, 'farm_data.csv')
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)
    print(f'[DATA] Generated {len(rows)} farms -> {path}')

def generate_demand_data():
    """Weekly antibiotic demand per governorate (52 weeks)"""
    rows = []
    for gov_idx, gov in enumerate(GOVERNORATES):
        for week in range(1, 53):
            for atc in ATC_CODES:
                season = 0 if week <= 13 else (1 if week <= 26 else (2 if week <= 39 else 3))
                base = random.randint(50, 200)
                # Seasonal variation
                seasonal_mult = 1.0 + 0.3 * math.sin(2 * math.pi * week / 52)
                # Reserve drugs have lower demand
                if AWARE_CLASSES[atc] == 'Reserve':
                    base = int(base * 0.1)
                demand = max(0, int(base * seasonal_mult + random.gauss(0, 10)))
                rows.append({
                    'governorate': gov,
                    'governorate_code': gov_idx,
                    'week': week,
                    'atc_code': atc,
                    'aware_class': AWARE_CLASSES[atc],
                    'season': season,
                    'demand': demand
                })

    path = os.path.join(DATA_DIR, 'demand_data.csv')
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)
    print(f'[DATA] Generated {len(rows)} demand records -> {path}')

if __name__ == '__main__':
    generate_vet_data()
    generate_farm_data()
    generate_demand_data()
    print('[DATA] All synthetic data generated successfully!')
