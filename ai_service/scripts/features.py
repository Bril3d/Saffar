"""
SAFAR Chain — Demand Forecasting Feature Engineering
Shared feature engineering pipeline for XGBoost demand forecasting.
Computes cyclical seasonal encodings, autoregressive lag features, rolling statistics,
and one-hot ATC categorical features with zero future-data leakage.
"""
import numpy as np
import pandas as pd

ATC_CODES = ['J01CA04', 'J01CE01', 'J01DB01', 'J01AA07', 'J01FA01', 'J01CR02', 'J01XB01']
AWARE_MAP = {
    'J01CA04': 'Access', 'J01CE01': 'Access', 'J01DB01': 'Access',
    'J01AA07': 'Watch', 'J01FA01': 'Watch', 'J01CR02': 'Watch',
    'J01XB01': 'Reserve'
}
GOVERNORATE_MAP = {
    'Tunis': 0, 'Ariana': 1, 'Ben_Arous': 2, 'Manouba': 3, 'Nabeul': 4, 'Zaghouan': 5,
    'Bizerte': 6, 'Beja': 7, 'Jendouba': 8, 'Kef': 9, 'Siliana': 10, 'Sousse': 11
}
REVERSE_GOV_MAP = {v: k for k, v in GOVERNORATE_MAP.items()}

FEATURE_COLS = [
    'governorate_code', 'week', 'season',
    'sin_week', 'cos_week',
    'lag_1', 'lag_2', 'rolling_mean_4w'
] + [f'atc_{code}' for code in ATC_CODES]

def build_features(df, history_df=None, train_stats=None, is_train=True):
    """
    Computes feature matrix from DataFrame of weekly demand records.
    When history_df is provided (e.g. for test sets), past history is prepended
    strictly to calculate lags across the split boundary without future-data leakage.
    Imputations and encodings are derived strictly from training statistics.
    """
    if history_df is not None and not history_df.empty:
        min_week = df['week'].min()
        valid_hist = history_df[history_df['week'] < min_week].copy()
        combined = pd.concat([valid_hist, df], ignore_index=True)
    else:
        combined = df.copy()

    combined = combined.sort_values(['governorate_code', 'atc_code', 'week']).reset_index(drop=True)

    # 1. Cyclical Seasonal Encodings
    combined['sin_week'] = np.sin(2 * np.pi * combined['week'] / 52)
    combined['cos_week'] = np.cos(2 * np.pi * combined['week'] / 52)

    # 2. Autoregressive Lags & Rolling Window
    # Shifted by 1 so only strictly prior weeks are used
    combined['lag_1'] = combined.groupby(['governorate_code', 'atc_code'])['demand'].shift(1)
    combined['lag_2'] = combined.groupby(['governorate_code', 'atc_code'])['demand'].shift(2)
    combined['rolling_mean_4w'] = (
        combined.groupby(['governorate_code', 'atc_code'])['demand']
        .shift(1)
        .rolling(4, min_periods=1)
        .mean()
    )

    # 3. Compute training statistics if this is the training split
    if is_train or train_stats is None:
        group_means = combined.groupby(['governorate_code', 'atc_code'])['demand'].mean().to_dict()
        global_mean = float(combined['demand'].mean())
        train_stats = {
            'group_means': {f"{k[0]}_{k[1]}": float(v) for k, v in group_means.items()},
            'global_mean': global_mean
        }

    # Slice back strictly to the target df rows
    if history_df is not None and not history_df.empty:
        target_weeks = set(df['week'].unique())
        data = combined[combined['week'].isin(target_weeks)].copy().reset_index(drop=True)
    else:
        data = combined

    # 4. Handle initial missing lags (weeks 1 and 2) using train statistics
    for idx, row in data.iterrows():
        key = f"{int(row['governorate_code'])}_{row['atc_code']}"
        fallback = train_stats['group_means'].get(key, train_stats['global_mean'])
        if pd.isna(data.at[idx, 'lag_1']):
            data.at[idx, 'lag_1'] = fallback
        if pd.isna(data.at[idx, 'lag_2']):
            data.at[idx, 'lag_2'] = fallback
        if pd.isna(data.at[idx, 'rolling_mean_4w']):
            data.at[idx, 'rolling_mean_4w'] = fallback

    # 5. One-Hot Categorical Encoding for ATC Codes
    for code in ATC_CODES:
        col_name = f'atc_{code}'
        data[col_name] = (data['atc_code'] == code).astype(float)

    return data, FEATURE_COLS, train_stats

def prepare_inference_features(history_df, governorate_code, target_week, train_stats):
    """
    Prepares feature vectors for all 7 ATC codes for a target prediction week
    using only historical observations up to target_week - 1.
    """
    season = 0 if target_week <= 13 else (1 if target_week <= 26 else (2 if target_week <= 39 else 3))
    sin_week = np.sin(2 * np.pi * target_week / 52)
    cos_week = np.cos(2 * np.pi * target_week / 52)

    rows = []
    for atc in ATC_CODES:
        # Filter past demand for this specific (governorate, atc)
        past_demand = history_df[
            (history_df['governorate_code'] == governorate_code) &
            (history_df['atc_code'] == atc) &
            (history_df['week'] < target_week)
        ].sort_values('week')

        key = f"{governorate_code}_{atc}"
        fallback = train_stats.get('group_means', {}).get(key, train_stats.get('global_mean', 100.0))

        if len(past_demand) >= 1:
            lag_1 = float(past_demand.iloc[-1]['demand'])
        else:
            lag_1 = fallback

        if len(past_demand) >= 2:
            lag_2 = float(past_demand.iloc[-2]['demand'])
        else:
            lag_2 = fallback

        if len(past_demand) >= 1:
            rolling_mean = float(past_demand.tail(4)['demand'].mean())
        else:
            rolling_mean = fallback

        row = {
            'governorate_code': float(governorate_code),
            'week': float(target_week),
            'season': float(season),
            'sin_week': float(sin_week),
            'cos_week': float(cos_week),
            'lag_1': float(lag_1),
            'lag_2': float(lag_2),
            'rolling_mean_4w': float(rolling_mean)
        }

        for code in ATC_CODES:
            row[f'atc_{code}'] = 1.0 if code == atc else 0.0

        rows.append(row)

    feat_df = pd.DataFrame(rows)
    return feat_df[FEATURE_COLS].values
