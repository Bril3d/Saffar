"""
SAFAR Chain — Anomaly Detection Evaluation Harness
Compares Isolation Forest against baselines on a held-out test split using synthetic benchmark labels.
Performs sensitivity analysis across contamination levels and logs results to MLflow.
"""
import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score

try:
    import mlflow
    MLFLOW_AVAILABLE = True
except ImportError:
    MLFLOW_AVAILABLE = False

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
REPORTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'reports')
os.makedirs(REPORTS_DIR, exist_ok=True)

def compute_metrics(y_true, y_pred):
    """Computes confusion matrix, precision, recall, F1, and False Positive Rate (FPR)."""
    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    return {
        'confusion_matrix': {'tn': int(tn), 'fp': int(fp), 'fn': int(fn), 'tp': int(tp)},
        'precision': round(float(prec), 4),
        'recall': round(float(rec), 4),
        'f1': round(float(f1), 4),
        'fpr': round(float(fpr), 4)
    }

def evaluate_dataset(dataset_name, df, features, heuristic_fn, test_size=0.20, seed=42):
    """
    Strict held-out evaluation:
    - Stratified train/test split.
    - Preprocessing fit strictly on train split.
    - Isolation Forest vs Z-score Baseline vs Domain Heuristic vs Prior Dummy Baseline.
    - Contamination sweep on held-out test split.
    """
    print(f"\n=======================================================")
    print(f" EVALUATION: {dataset_name.upper()} ANOMALY DETECTION")
    print(f"=======================================================")
    
    X = df[features].values
    y = df['is_anomaly'].values

    # 1. Stratified Held-out Split
    X_train, X_test, y_train, y_test, df_train, df_test = train_test_split(
        X, y, df, test_size=test_size, stratify=y, random_state=seed
    )
    
    print(f"Total: {len(df)} | Train: {len(X_train)} (pos: {int(y_train.sum())}) | Test: {len(X_test)} (pos: {int(y_test.sum())})")
    
    # 2. Preprocessing (Fit strictly on Train)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    results = {'dataset': dataset_name, 'models': {}, 'contamination_sweep': []}

    # 3. Model: Isolation Forest (Candidate model, calibrated default contamination ~0.025/0.05)
    default_contam = 0.025 if dataset_name == 'vet' else 0.05
    iso_forest = IsolationForest(contamination=default_contam, random_state=seed, n_estimators=100)
    iso_forest.fit(X_train_scaled)
    y_pred_iso = (iso_forest.predict(X_test_scaled) == -1).astype(int)
    results['models']['IsolationForest'] = compute_metrics(y_test, y_pred_iso)
    results['models']['IsolationForest']['params'] = {'contamination': default_contam, 'n_estimators': 100}

    # 4. Baseline 1: Domain Heuristic Rule
    y_pred_heuristic = heuristic_fn(df_test)
    results['models']['HeuristicRule'] = compute_metrics(y_test, y_pred_heuristic)

    # 5. Baseline 2: Z-Score Outlier Detector (Z computed from training mean & std)
    train_mean = np.mean(X_train, axis=0)
    train_std = np.std(X_train, axis=0)
    train_std[train_std == 0] = 1.0
    z_scores_test = np.abs((X_test - train_mean) / train_std)
    # Flag anomaly if any feature has |z| > 2.5
    y_pred_z = (np.max(z_scores_test, axis=1) > 2.5).astype(int)
    results['models']['ZScore_Threshold_2.5'] = compute_metrics(y_test, y_pred_z)

    # 6. Baseline 3: Dummy Prior Stratified Predictor
    prior = float(np.mean(y_train))
    rng = np.random.RandomState(seed)
    y_pred_dummy = (rng.uniform(0, 1, size=len(y_test)) < prior).astype(int)
    results['models']['DummyPrior'] = compute_metrics(y_test, y_pred_dummy)

    # 7. Contamination Sensitivity Sweep
    contam_values = [0.01, 0.02, 0.025, 0.03, 0.05, 0.08, 0.10]
    print("\n--- Contamination Sensitivity Sweep (on Held-out Test Set) ---")
    print(f"{'Contam':>8} | {'Precision':>9} | {'Recall':>7} | {'F1':>6} | {'FPR':>6} | {'CM (TN,FP,FN,TP)':>18}")
    print("-" * 65)
    
    for c in contam_values:
        clf = IsolationForest(contamination=c, random_state=seed, n_estimators=100)
        clf.fit(X_train_scaled)
        preds = (clf.predict(X_test_scaled) == -1).astype(int)
        m = compute_metrics(y_test, preds)
        cm = m['confusion_matrix']
        cm_str = f"({cm['tn']}, {cm['fp']}, {cm['fn']}, {cm['tp']})"
        print(f"{c:8.3f} | {m['precision']:9.4f} | {m['recall']:7.4f} | {m['f1']:6.4f} | {m['fpr']:6.4f} | {cm_str:>18}")
        results['contamination_sweep'].append({
            'contamination': c,
            **m
        })

    # Print Comparison Table
    print(f"\n--- Model Comparison on Identical Held-out Test Set ({dataset_name}) ---")
    print(f"{'Model':<25} | {'Precision':>9} | {'Recall':>7} | {'F1':>6} | {'FPR':>6} | {'CM (TN,FP,FN,TP)':>18}")
    print("-" * 80)
    for name, res in results['models'].items():
        cm = res['confusion_matrix']
        cm_str = f"({cm['tn']}, {cm['fp']}, {cm['fn']}, {cm['tp']})"
        print(f"{name:<25} | {res['precision']:9.4f} | {res['recall']:7.4f} | {res['f1']:6.4f} | {res['fpr']:6.4f} | {cm_str:>18}")

    return results

def vet_heuristic(df_sub):
    """Domain rule: over 100 prescriptions/month OR high reserve class ratio (> 0.20)."""
    cond = (df_sub['prescriptions_per_month'] > 100) | (df_sub['reserve_class_ratio'] > 0.20)
    return cond.astype(int).values

def farm_heuristic(df_sub):
    """Domain rule: volume to lot ratio > 2.0 (selling twice declared herd capacity)."""
    cond = df_sub['volume_to_lot_ratio'] > 2.0
    return cond.astype(int).values

def run_evaluation():
    vet_path = os.path.join(DATA_DIR, 'vet_data.csv')
    farm_path = os.path.join(DATA_DIR, 'farm_data.csv')
    
    if not os.path.exists(vet_path) or not os.path.exists(farm_path):
        raise FileNotFoundError("Datasets not found. Run generate_data.py first.")
        
    vet_df = pd.read_csv(vet_path)
    farm_df = pd.read_csv(farm_path)

    vet_features = ['prescriptions_per_month', 'unique_farms', 'avg_dosage', 'reserve_class_ratio']
    farm_features = ['declared_lot_size', 'sales_volume', 'volume_to_lot_ratio']

    vet_results = evaluate_dataset('vet', vet_df, vet_features, vet_heuristic)
    farm_results = evaluate_dataset('farm', farm_df, farm_features, farm_heuristic)

    summary = {
        'vet_evaluation': vet_results,
        'farm_evaluation': farm_results,
        'note': 'Evaluated strictly against synthetic simulation labels. Not real-world gold standards.'
    }

    report_path = os.path.join(REPORTS_DIR, 'anomaly_evaluation_report.json')
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)
    print(f"\n[REPORT] Saved evaluation report -> {report_path}")

    # Optional MLflow logging
    if MLFLOW_AVAILABLE:
        try:
            mlflow.set_experiment("SAFAR_Anomaly_Detection")
            with mlflow.start_run(run_name="anomaly_heldout_evaluation"):
                mlflow.log_params({
                    'vet_contamination': vet_results['models']['IsolationForest']['params']['contamination'],
                    'farm_contamination': farm_results['models']['IsolationForest']['params']['contamination'],
                    'test_size': 0.20,
                    'seed': 42
                })
                mlflow.log_metrics({
                    'vet_iso_precision': vet_results['models']['IsolationForest']['precision'],
                    'vet_iso_recall': vet_results['models']['IsolationForest']['recall'],
                    'vet_iso_f1': vet_results['models']['IsolationForest']['f1'],
                    'vet_iso_fpr': vet_results['models']['IsolationForest']['fpr'],
                    'farm_iso_precision': farm_results['models']['IsolationForest']['precision'],
                    'farm_iso_recall': farm_results['models']['IsolationForest']['recall'],
                    'farm_iso_f1': farm_results['models']['IsolationForest']['f1'],
                    'farm_iso_fpr': farm_results['models']['IsolationForest']['fpr'],
                })
                mlflow.log_artifact(report_path)
                print("[MLFLOW] Anomaly detection evaluation metrics and artifact logged successfully.")
        except Exception as e:
            print(f"[MLFLOW] Warning: could not log to MLflow: {e}")

    return summary

if __name__ == '__main__':
    run_evaluation()
