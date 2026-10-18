"""
Tests for Evaluation Metric Calculations (Precision, Recall, F1, FPR, MAE, RMSE, R2)
"""
import numpy as np
import pytest

from scripts.evaluate_anomaly import compute_metrics
from scripts.evaluate_forecast import compute_regression_metrics

def test_anomaly_compute_metrics():
    # Perfect classifier
    y_true = np.array([0, 0, 0, 1, 1])
    y_pred = np.array([0, 0, 0, 1, 1])
    m = compute_metrics(y_true, y_pred)
    assert m['precision'] == 1.0
    assert m['recall'] == 1.0
    assert m['f1'] == 1.0
    assert m['fpr'] == 0.0
    assert m['confusion_matrix'] == {'tn': 3, 'fp': 0, 'fn': 0, 'tp': 2}

    # Classifier with False Positive
    y_true_fp = np.array([0, 0, 0, 1])
    y_pred_fp = np.array([0, 0, 1, 1])  # 1 FP
    m_fp = compute_metrics(y_true_fp, y_pred_fp)
    assert m_fp['precision'] == 0.5  # 1 TP / (1 TP + 1 FP)
    assert m_fp['recall'] == 1.0
    assert m_fp['fpr'] == pytest.approx(1.0 / 3.0, abs=1e-4)  # FP / (FP + TN)
    assert m_fp['confusion_matrix'] == {'tn': 2, 'fp': 1, 'fn': 0, 'tp': 1}

def test_regression_compute_metrics():
    # Exact predictions
    y_true = np.array([10.0, 20.0, 30.0, 40.0])
    y_pred = np.array([10.0, 20.0, 30.0, 40.0])
    reg = compute_regression_metrics(y_true, y_pred)
    assert reg['mae'] == 0.0
    assert reg['rmse'] == 0.0
    assert reg['r2'] == 1.0

    # Constant error of 5.0
    y_pred_err = np.array([15.0, 25.0, 35.0, 45.0])
    reg_err = compute_regression_metrics(y_true, y_pred_err)
    assert reg_err['mae'] == 5.0
    assert reg_err['rmse'] == 5.0
    assert reg_err['r2'] == 0.8
