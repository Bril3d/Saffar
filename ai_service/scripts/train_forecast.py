"""
SAFAR Chain — Demand Forecast Model Training
Trains XGBoost on weekly antibiotic demand
"""
import os
import pandas as pd
from xgboost import XGBRegressor
from sklearn.preprocessing import LabelEncoder
import joblib

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

def train_forecast():
    df = pd.read_csv(os.path.join(DATA_DIR, 'demand_data.csv'))

    le_atc = LabelEncoder()
    df['atc_encoded'] = le_atc.fit_transform(df['atc_code'])

    features = ['governorate_code', 'week', 'atc_encoded', 'season']
    X = df[features].values
    y = df['demand'].values

    model = XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42)
    model.fit(X, y)

    joblib.dump(model, os.path.join(MODEL_DIR, 'demand_forecast.joblib'))
    joblib.dump(le_atc, os.path.join(MODEL_DIR, 'atc_encoder.joblib'))

    # Verify with a prediction
    sample = X[:5]
    preds = model.predict(sample)
    print(f'[TRAIN] Forecast model trained. Sample predictions: {preds[:5]}')

if __name__ == '__main__':
    train_forecast()
    print('[TRAIN] Forecast model trained successfully!')
