"""
Tests for Temporal Chronological Splits & Zero-Leakage Lag Feature Engineering
"""
import pandas as pd
import numpy as np
import pytest

from scripts.features import (
    build_features,
    prepare_inference_features,
    FEATURE_COLS,
    ATC_CODES
)

def test_temporal_holdout_no_leakage():
    # Construct synthetic 10-week multi-series demand
    rows = []
    for week in range(1, 11):
        for gov in [0, 1]:
            for atc in ATC_CODES[:2]:
                rows.append({
                    'governorate_code': gov,
                    'atc_code': atc,
                    'week': week,
                    'season': 0,
                    'demand': week * 10 + gov
                })
    df = pd.DataFrame(rows)

    train_raw = df[df['week'] <= 7].copy()
    test_raw = df[df['week'] > 7].copy()

    assert train_raw['week'].max() < test_raw['week'].min()
    assert len(set(train_raw['week']).intersection(set(test_raw['week']))) == 0

    train_feat, feat_cols, train_stats = build_features(train_raw, is_train=True)
    test_feat, _, _ = build_features(test_raw, history_df=train_raw, train_stats=train_stats, is_train=False)

    # Check that test lag 1 for week 8 is strictly week 7 demand
    w8_row = test_feat[(test_feat['week'] == 8) & (test_feat['governorate_code'] == 0) & (test_feat['atc_code'] == ATC_CODES[0])]
    assert not w8_row.empty
    expected_lag1 = 70.0  # week 7 demand for gov 0
    assert w8_row.iloc[0]['lag_1'] == expected_lag1

def test_prepare_inference_features_strictly_historical():
    rows = []
    for week in range(1, 15):
        for atc in ATC_CODES:
            rows.append({
                'governorate_code': 0,
                'atc_code': atc,
                'week': week,
                'season': 0,
                'demand': week * 5
            })
    df = pd.DataFrame(rows)
    train_stats = {'group_means': {}, 'global_mean': 50.0}

    # Predict for target week 15
    X_inf = prepare_inference_features(df, governorate_code=0, target_week=15, train_stats=train_stats)
    assert X_inf.shape == (len(ATC_CODES), len(FEATURE_COLS))

    # All predictions must have target week 15 in feature column
    week_idx = FEATURE_COLS.index('week')
    assert (X_inf[:, week_idx] == 15.0).all()

    # Lag 1 must reflect week 14 demand (14 * 5 = 70.0)
    lag1_idx = FEATURE_COLS.index('lag_1')
    assert (X_inf[:, lag1_idx] == 70.0).all()
