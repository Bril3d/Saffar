"""
SAFAR Chain — Demand Forecasting Evaluation Harness
Evaluates XGBoost against baselines on identical test samples using:
1. Chronological Out-of-Time Holdout Split (Weeks 1-40 Train, Weeks 41-52 Test)
2. Rolling-Origin Expanding-Window Cross-Validation (3 Folds)
Reports MAE, RMSE, and R2 with zero data leakage and logs results to MLflow.
"""
import os
import json
import numpy as np
import pandas as pd
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from features import (
    build_features,
    FEATURE_COLS,
    ATC_CODES,
    GOVERNORATE_MAP
)

try:
    import mlflow
    MLFLOW_AVAILABLE = True
except ImportError:
    MLFLOW_AVAILABLE = False

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
REPORTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'reports')
os.makedirs(REPORTS_DIR, exist_ok=True)

def compute_regression_metrics(y_true, y_pred):
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    return {
        'mae': round(float(mae), 4),
        'rmse': round(float(rmse), 4),
        'r2': round(float(r2), 4)
    }

def evaluate_holdout(df, split_week=40, seed=42):
    """
    Chronological Out-of-Time Holdout Split:
    - Train: Weeks <= split_week (e.g. Weeks 1 to 40)
    - Test: Weeks > split_week (e.g. Weeks 41 to 52)
    All preprocessing, group means, and encodings fit ONLY on Train partition.
    """
    print(f"\n=======================================================")
    print(f" 1. CHRONOLOGICAL HOLDOUT EVALUATION (Train <= Wk {split_week}, Test > Wk {split_week})")
    print(f"=======================================================")

    train_raw = df[df['week'] <= split_week].copy()
    test_raw = df[df['week'] > split_week].copy()

    # Build features with zero leakage
    train_feat, feat_cols, train_stats = build_features(train_raw, is_train=True)
    test_feat, _, _ = build_features(test_raw, history_df=train_raw, train_stats=train_stats, is_train=False)

    X_train = train_feat[feat_cols].values
    y_train = train_feat['demand'].values
    X_test = test_feat[feat_cols].values
    y_test = test_feat['demand'].values

    print(f"Train samples: {len(X_train)} (Weeks 1 to {split_week}) | Test samples: {len(X_test)} (Weeks {split_week+1} to 52)")

    results = {}

    # Candidate Model: XGBoost Regressor
    xgb = XGBRegressor(n_estimators=100, max_depth=5, learning_rate=0.08, random_state=seed)
    xgb.fit(X_train, y_train)
    y_pred_xgb = xgb.predict(X_test)
    results['XGBoost'] = compute_regression_metrics(y_test, y_pred_xgb)

    # Baseline 1: Historical Group Mean (by governorate_code, atc_code from train split)
    group_means = train_raw.groupby(['governorate_code', 'atc_code'])['demand'].mean().to_dict()
    global_mean = float(train_raw['demand'].mean())
    y_pred_group = [
        group_means.get((r['governorate_code'], r['atc_code']), global_mean)
        for _, r in test_raw.iterrows()
    ]
    results['Baseline_Historical_Group_Mean'] = compute_regression_metrics(y_test, y_pred_group)

    # Baseline 2: Persistence / Last Observation (Demand of week split_week)
    last_week_data = train_raw[train_raw['week'] == split_week].set_index(['governorate_code', 'atc_code'])['demand'].to_dict()
    y_pred_persist = [
        last_week_data.get((r['governorate_code'], r['atc_code']), global_mean)
        for _, r in test_raw.iterrows()
    ]
    results['Baseline_Last_Observation_Persistence'] = compute_regression_metrics(y_test, y_pred_persist)

    # Baseline 3: Global Train Mean
    y_pred_mean = np.full_like(y_test, global_mean)
    results['Baseline_Global_Mean'] = compute_regression_metrics(y_test, y_pred_mean)

    print(f"\n--- Holdout Results on Identical Test Samples (Weeks {split_week+1}-52, N={len(y_test)}) ---")
    print(f"{'Model / Baseline':<40} | {'MAE':>8} | {'RMSE':>8} | {'R2':>8}")
    print("-" * 72)
    for name, m in results.items():
        print(f"{name:<40} | {m['mae']:8.4f} | {m['rmse']:8.4f} | {m['r2']:8.4f}")

    return results, xgb, train_stats

def evaluate_rolling_origin(df, folds=[(28, 36), (36, 44), (44, 52)], seed=42):
    """
    Rolling-Origin (Expanding Window) Evaluation:
    For each fold:
      - Train on all weeks up to fold_train_end
      - Test on weeks (fold_train_end + 1) to fold_test_end
      - Compute metrics for all models on identical rows
    """
    print(f"\n=======================================================")
    print(f" 2. ROLLING-ORIGIN (EXPANDING WINDOW) EVALUATION ({len(folds)} Folds)")
    print(f"=======================================================")

    fold_metrics = {'XGBoost': [], 'Baseline_Historical_Group_Mean': [], 'Baseline_Last_Observation_Persistence': [], 'Baseline_Global_Mean': []}

    for fold_idx, (train_end, test_end) in enumerate(folds, 1):
        train_raw = df[df['week'] <= train_end].copy()
        test_raw = df[(df['week'] > train_end) & (df['week'] <= test_end)].copy()

        train_feat, feat_cols, train_stats = build_features(train_raw, is_train=True)
        test_feat, _, _ = build_features(test_raw, history_df=train_raw, train_stats=train_stats, is_train=False)

        X_train = train_feat[feat_cols].values
        y_train = train_feat['demand'].values
        X_test = test_feat[feat_cols].values
        y_test = test_feat['demand'].values

        # XGBoost
        xgb = XGBRegressor(n_estimators=100, max_depth=5, learning_rate=0.08, random_state=seed)
        xgb.fit(X_train, y_train)
        pred_xgb = xgb.predict(X_test)
        fold_metrics['XGBoost'].append(compute_regression_metrics(y_test, pred_xgb))

        # Baselines
        global_mean = float(train_raw['demand'].mean())
        group_means = train_raw.groupby(['governorate_code', 'atc_code'])['demand'].mean().to_dict()
        pred_group = [group_means.get((r['governorate_code'], r['atc_code']), global_mean) for _, r in test_raw.iterrows()]
        fold_metrics['Baseline_Historical_Group_Mean'].append(compute_regression_metrics(y_test, pred_group))

        last_obs = train_raw[train_raw['week'] == train_end].set_index(['governorate_code', 'atc_code'])['demand'].to_dict()
        pred_persist = [last_obs.get((r['governorate_code'], r['atc_code']), global_mean) for _, r in test_raw.iterrows()]
        fold_metrics['Baseline_Last_Observation_Persistence'].append(compute_regression_metrics(y_test, pred_persist))

        pred_mean = np.full_like(y_test, global_mean)
        fold_metrics['Baseline_Global_Mean'].append(compute_regression_metrics(y_test, pred_mean))

        print(f"Fold {fold_idx} (Train <= Wk {train_end}, Test Wks {train_end+1}-{test_end}, N={len(y_test)}): "
              f"XGB MAE={fold_metrics['XGBoost'][-1]['mae']:.2f} | "
              f"GroupMean MAE={fold_metrics['Baseline_Historical_Group_Mean'][-1]['mae']:.2f} | "
              f"Persistence MAE={fold_metrics['Baseline_Last_Observation_Persistence'][-1]['mae']:.2f}")

    # Summary table across folds
    summary = {}
    print(f"\n--- Mean Rolling-Origin Results Across All {len(folds)} Folds ---")
    print(f"{'Model / Baseline':<40} | {'Mean MAE':>9} | {'Mean RMSE':>9} | {'Mean R2':>8}")
    print("-" * 73)
    for model_name, metrics_list in fold_metrics.items():
        mean_mae = float(np.mean([m['mae'] for m in metrics_list]))
        mean_rmse = float(np.mean([m['rmse'] for m in metrics_list]))
        mean_r2 = float(np.mean([m['r2'] for m in metrics_list]))
        summary[model_name] = {
            'mean_mae': round(mean_mae, 4),
            'mean_rmse': round(mean_rmse, 4),
            'mean_r2': round(mean_r2, 4),
            'fold_details': metrics_list
        }
        print(f"{model_name:<40} | {mean_mae:9.4f} | {mean_rmse:9.4f} | {mean_r2:8.4f}")

    return summary

def run_evaluation():
    demand_path = os.path.join(DATA_DIR, 'demand_data.csv')
    if not os.path.exists(demand_path):
        raise FileNotFoundError(f"Demand data not found at {demand_path}. Run generate_data.py first.")

    df = pd.read_csv(demand_path)

    # 1. Chronological Holdout Evaluation (Weeks 1-40 Train, Weeks 41-52 Test)
    holdout_results, trained_xgb, train_stats = evaluate_holdout(df, split_week=40)

    # 2. Rolling-Origin Expanding Window Evaluation
    rolling_results = evaluate_rolling_origin(df)

    report = {
        'chronological_holdout_evaluation': holdout_results,
        'rolling_origin_evaluation': rolling_results,
        'feature_engineering': {
            'features_used': FEATURE_COLS,
            'lags': ['lag_1', 'lag_2', 'rolling_mean_4w'],
            'cyclical': ['sin_week', 'cos_week'],
            'categorical': 'one_hot_encoded_atc'
        },
        'dataset_provenance': 'Synthetic simulation dataset generated via scripts/generate_data.py'
    }

    report_path = os.path.join(REPORTS_DIR, 'forecast_evaluation_report.json')
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)
    print(f"\n[REPORT] Saved forecast evaluation report -> {report_path}")

    # MLflow Tracking
    if MLFLOW_AVAILABLE:
        try:
            mlflow.set_experiment("SAFAR_Demand_Forecasting")
            with mlflow.start_run(run_name="chronological_and_rolling_evaluation"):
                mlflow.log_params({
                    'model': 'XGBRegressor',
                    'n_estimators': 100,
                    'max_depth': 5,
                    'learning_rate': 0.08,
                    'holdout_train_weeks': '1-40',
                    'holdout_test_weeks': '41-52',
                    'num_rolling_folds': 3
                })
                mlflow.log_metrics({
                    'holdout_xgb_mae': holdout_results['XGBoost']['mae'],
                    'holdout_xgb_rmse': holdout_results['XGBoost']['rmse'],
                    'holdout_xgb_r2': holdout_results['XGBoost']['r2'],
                    'holdout_group_mean_mae': holdout_results['Baseline_Historical_Group_Mean']['mae'],
                    'holdout_persist_mae': holdout_results['Baseline_Last_Observation_Persistence']['mae'],
                    'rolling_mean_xgb_mae': rolling_results['XGBoost']['mean_mae'],
                    'rolling_mean_group_mae': rolling_results['Baseline_Historical_Group_Mean']['mean_mae'],
                })
                mlflow.log_artifact(report_path)
                print("[MLFLOW] Forecast evaluation metrics and report artifact logged successfully.")
        except Exception as e:
            print(f"[MLFLOW] Warning: could not log to MLflow: {e}")

    return report

if __name__ == '__main__':
    run_evaluation()
