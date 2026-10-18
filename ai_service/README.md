# 🤖 SAFAR Chain — AI & Machine Learning Service

Python FastAPI microservice implementing Layer 1 intelligence for the SAFAR Chain platform:
- **Veterinary & Farm Anomaly Detection:** Unsupervised `IsolationForest` calibrated to empirical outlier rates.
- **Regional Antibiotic Demand Forecasting:** `XGBoostRegressor` with zero-leakage cyclical and autoregressive lag feature engineering.
- **Reproducible MLOps:** Integrated with **MLflow** experiment tracking and **DVC** pipeline management.

---

## ⚠️ Dataset Provenance & Realistic Simulation Notice

> **Important:** All datasets (`vet_data.csv`, `farm_data.csv`, and `demand_data.csv`) are **100% synthetically generated** simulation benchmarks produced by [`scripts/generate_data.py`](scripts/generate_data.py) using fixed pseudo-random seeds.
> 
> - **No real clinical, veterinary, or farm commercial telemetry** is present in this repository.
> - Anomaly labels (`is_anomaly`) are heuristically injected to model over-prescription and lot overselling behaviors for prototype testing.
> - Do not cite performance on these benchmarks as real-world clinical or fraud-detection accuracy.

---

## 🛠️ Quick Start & Setup

### 1. Environment & Dependencies

Python 3.10+ is recommended. Install required packages:

```bash
cd ai_service
pip install -r requirements.txt
```

### 2. Generate Simulation Data

```bash
python scripts/generate_data.py
```
Outputs:
- `data/vet_data.csv` (205 records, 5 injected outliers)
- `data/farm_data.csv` (105 records, 5 injected fraud lots)
- `data/demand_data.csv` (4,368 records: 12 governorates × 52 weeks × 7 WHO AWaRe antibiotics)
- `data/provenance.json` (provenance metadata)

### 3. Train Models

```bash
python scripts/train_anomaly.py
python scripts/train_forecast.py
```
Serializes models into `models/` and logs runs to MLflow (`mlflow.db`).

### 4. Run Evaluation Harnesses

Run the reproducible evaluation scripts comparing against established baselines:

```bash
# Anomaly detection held-out evaluation & contamination sensitivity sweep
python scripts/evaluate_anomaly.py

# Demand forecasting chronological holdout (Weeks 1-40 / 41-52) & rolling-origin CV
python scripts/evaluate_forecast.py
```
Generated reports are stored in `reports/anomaly_evaluation_report.json` and `reports/forecast_evaluation_report.json`.

### 5. Run Automated Tests

```bash
python -m pytest tests/ -v
```
Runs 14 automated unit and integration tests covering data generation, zero temporal leakage, metric calculations, model serialization, and FastAPI endpoints.

### 6. Start API Server

```bash
python main.py
# Server starts on http://0.0.0.0:8001
```

---

## 📊 Benchmark Evaluation Results

All candidate models and baselines are evaluated on **identical held-out test samples**. Preprocessing, scalers, and group statistics are fit strictly on training partitions to prevent data leakage.

### 1. Anomaly Detection (Stratified 80/20 Held-Out Test Set)

Evaluated on held-out test partitions ($N=41$ for vets, $N=21$ for farms) with 1 positive sample each:

| Domain | Model / Baseline | Precision | Recall | F1 Score | False Positive Rate (FPR) | Confusion Matrix (TN, FP, FN, TP) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Vet** | **Isolation Forest (contam=0.025)** | **1.0000** | **1.0000** | **1.0000** | **0.0000** | **(40, 0, 0, 1)** |
| Vet | Domain Heuristic Rule | 1.0000 | 1.0000 | 1.0000 | 0.0000 | (40, 0, 0, 1) |
| Vet | Z-Score Outlier Baseline ($z > 2.5$) | 0.5000 | 1.0000 | 0.6667 | 0.0250 | (39, 1, 0, 1) |
| Vet | Dummy Prior Baseline | 1.0000 | 1.0000 | 1.0000 | 0.0000 | (40, 0, 0, 1) |
| **Farm** | **Isolation Forest (contam=0.05)** | **0.5000** | **1.0000** | **0.6667** | **0.0500** | **(19, 1, 0, 1)** |
| Farm | Domain Heuristic Rule | 1.0000 | 1.0000 | 1.0000 | 0.0000 | (20, 0, 0, 1) |
| Farm | Z-Score Outlier Baseline ($z > 2.5$) | 1.0000 | 1.0000 | 1.0000 | 0.0000 | (20, 0, 0, 1) |
| Farm | Dummy Prior Baseline | 0.0000 | 0.0000 | 0.0000 | 0.0500 | (19, 1, 1, 0) |

#### Contamination Parameter Sensitivity (Held-out Test Split)
- **Vet:** At `contamination=0.025`, Precision is 1.0000 and FPR is 0.0000. At `contamination >= 0.08`, forced false positives depress precision to 0.5000 and 0.2500.
- **Farm:** At `contamination=0.025`, Precision is 1.0000 and FPR is 0.0000. At `contamination=0.05`, Precision is 0.5000 (1 FP out of 20 normal samples).

---

### 2. Demand Forecasting Evaluation

#### A. Chronological Out-of-Time Holdout (Weeks 1–40 Train, Weeks 41–52 Test, N=1,008)
Evaluates 1-step-ahead forecasting over the entire final quarter without test-data influence:

| Model / Baseline | MAE | RMSE | $R^2$ Score | Description |
| :--- | :---: | :---: | :---: | :--- |
| **XGBoost (Feature Engineered)** | **30.19** | **38.58** | **0.3615** | Gradient boosted trees with lags ($t-1, t-2, \text{roll}_{4w}$) & cyclical week |
| **Baseline 1: Historical Group Mean** | 55.43 | 68.18 | -0.9937 | Average demand per `(governorate, drug)` computed on train split |
| **Baseline 2: Lag-1 Persistence** | 54.02 | 66.19 | -0.8794 | Repeats demand of week 40 for all test horizons |
| **Baseline 3: Global Train Mean** | 44.11 | 54.71 | -0.2839 | Static global mean of training split ($\bar{y} = 107.03$) |

*XGBoost achieves a **45.5% reduction in MAE** over the Historical Group Mean baseline and **31.6% reduction** over the Global Mean baseline.*

#### B. Rolling-Origin Expanding-Window Cross-Validation (3 Folds)
Tested across expanding chronological horizons:
- Fold 1: Train $\le$ Wk 28 $\to$ Test Wks 29–36 ($N=672$)
- Fold 2: Train $\le$ Wk 36 $\to$ Test Wks 37–44 ($N=672$)
- Fold 3: Train $\le$ Wk 44 $\to$ Test Wks 45–52 ($N=672$)

| Model / Baseline | Mean MAE | Mean RMSE | Mean $R^2$ |
| :--- | :---: | :---: | :---: |
| **XGBoost** | **30.17** | **37.96** | **0.3251** |
| Baseline: Historical Group Mean | 57.79 | 70.67 | -1.4182 |
| Baseline: Persistence | 52.34 | 64.89 | -0.9910 |
| Baseline: Global Mean | 46.58 | 57.90 | -0.6213 |

---

## 🗄️ MLOps: MLflow & DVC

### MLflow Experiment Tracking
Local tracking database `mlflow.db` records:
- Experiments: `SAFAR_Anomaly_Detection` and `SAFAR_Demand_Forecasting`
- Run parameters: hyperparameters, dataset split boundaries, feature lists
- Metrics: test Precision, Recall, F1, FPR, MAE, RMSE, $R^2$
- Artifacts: evaluation report JSONs and trained model `.joblib` files

To view the MLflow UI:
```bash
python -m mlflow ui --backend-store-uri sqlite:///mlflow.db
```

### DVC Pipeline Management
Pipeline stages are defined in [`dvc.yaml`](dvc.yaml):
- Reproduce complete end-to-end pipeline:
  ```bash
  python -m dvc repro
  ```
- Dry run:
  ```bash
  python -m dvc repro --dry
  ```

---

## 🌐 API Reference (FastAPI)

All endpoints preserve the existing API contract used by the Express backend and React Native frontend:

- `GET /health` — Service health and loaded model registry.
- `GET /ai/anomaly/vet/{vet_id}` — Isolation Forest decision score and anomaly classification for veterinarians.
- `GET /ai/anomaly/farm/{farmer_id}` — Fraud risk detection comparing sales volume against declared lot size.
- `GET /ai/forecast/{governorate}` — 7-drug forecast for the specified Tunisian governorate (optional `?week=N` query param).

---

## 🎯 Defensible CV Bullet Points

When describing this project on your resume or in technical interviews:

- **Architecture & System Design:**  
  *"Architected and deployed a multi-model FastAPI AI microservice supporting veterinary traceability, integrating calibrated Isolation Forest anomaly detection and XGBoost time-series demand forecasting with MLflow tracking and DVC pipeline versioning."*
- **ML Methodology & Validation:**  
  *"Engineered zero-leakage temporal validation harnesses (chronological holdouts and rolling-origin expanding-window splits), evaluating gradient boosted trees against persistence and historical group-mean baselines, achieving a 45.5% MAE reduction."*
- **Feature Engineering & Integrity:**  
  *"Designed autoregressive lag structures ($t-1, t-2, \text{roll}_{4w}$) and cyclical trigonometric seasonal encodings, eliminating future-data contamination across out-of-time test partitions."*
