# Industrial Anomaly Detection System

> Predictive maintenance for rotating machinery — ML-based anomaly detection on bearing vibration data with an interactive dashboard.

---

## Architecture (Sprint 1 — Foundation)

```
Raw Vibration CSV
        │
        ▼
┌─────────────────┐
│  Signal Windowing│  window_signal()  — 1024-sample overlapping windows
└───────┬─────────┘
        ▼
┌─────────────────┐
│ Feature Extraction│  30 features: time / frequency / wavelet domains
└───────┬─────────┘
        ▼
┌─────────────────┐
│  Normalization   │  StandardScaler fit on normal data only
└───────┬─────────┘
        ▼
┌─────────────────┐
│  Autoencoder     │  Reconstruction-error anomaly scoring
│  Anomaly Detector│  95th-percentile adaptive threshold
└─────────────────┘
```

---

## Quick Start

### 1. Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Generate synthetic bearing data

```bash
cd ml_pipeline/scripts
python download_data.py --mode synthetic
# Creates data/raw/bearing_1.csv … bearing_4.csv
```

### 3. Run unit tests

```bash
cd backend
pytest tests/ -v
```

### 4. Train the baseline Autoencoder

```bash
cd ml_pipeline/scripts
python train_models.py
# Prints Precision / Recall / F1
# Saves model + report to data/models/
```

### 5. Explore in Jupyter

```bash
cd ml_pipeline/notebooks
jupyter notebook 01_data_exploration.ipynb
jupyter notebook 02_feature_engineering.ipynb
```

### 6. Docker (optional)

```bash
cd infrastructure
docker-compose up --build ml-tests      # run tests
docker-compose up --build ml-backend    # generate data
docker-compose up --build ml-train      # train model
```

---

## Project Layout

```
├── backend/
│   ├── app/
│   │   ├── models/            Autoencoder + AnomalyDetector
│   │   └── preprocessing/     Signal windowing, feature extraction, normalization
│   ├── tests/                 Pytest unit tests
│   ├── requirements.txt
│   └── Dockerfile
├── ml_pipeline/
│   ├── notebooks/             Jupyter exploration & feature analysis
│   └── scripts/               Data generation & training pipeline
├── infrastructure/
│   └── docker-compose.yml
├── data/                      ← gitignored; created at runtime
│   ├── raw/                   Generated CSVs
│   └── models/                Trained artifacts + evaluation report
└── PROJECT_BRIEF.md           Full system specification & roadmap
```

---

## Feature Set (30 features)

| Domain     | Features |
|------------|----------|
| Time       | RMS, Peak, Crest Factor, Kurtosis, Skewness, Std Dev, Energy, MAV, Peak-to-Peak, Impulse Factor |
| Frequency  | Dominant Freq, Spectral Centroid, Rolloff 85%, Spread, Band Power ×4, Freq Variance, Spectral Kurtosis |
| Wavelet    | Detail Energy ×4, Approx Energy, Entropy ×4, Wavelet Variance |

---

## Tech Stack
**Backend:** Python 3.11, PyTorch, scikit-learn, SciPy, PyWavelets, NumPy, Pandas
**Frontend (Sprint 3+):** React 18 + TypeScript, D3.js, Recharts, TailwindCSS
**Infrastructure:** Docker, GitHub Actions
