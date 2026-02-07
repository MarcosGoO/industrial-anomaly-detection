# Anomaly Detection Models

This directory contains the ML models for industrial machinery anomaly detection.

## Models Overview

### 1. Autoencoder (`autoencoder.py`)
**Type:** Reconstruction-based anomaly detection
**Architecture:**
- Encoder: input → 128 → 64 → 32 → 16 (latent space)
- Decoder: 16 → 32 → 64 → 128 → output

**How it works:**
- Learns to reconstruct "normal" patterns during training
- Anomaly score = reconstruction error (MSE)
- Higher reconstruction error = more anomalous

**Usage:**
```python
from app.models import AutoencoderDetector

detector = AutoencoderDetector(input_dim=30)
detector.train_model(X_train_normal, epochs=100)
detector.compute_threshold(X_val_normal, percentile=95)
scores, labels = detector.predict(X_test)
```

---

### 2. Isolation Forest (`isolation_forest.py`)
**Type:** Tree-based outlier detection
**Parameters:**
- n_estimators: 100
- contamination: 0.1
- max_samples: 256

**How it works:**
- Isolates outliers using random decision trees
- Anomalies are easier to isolate (require fewer splits)
- Fast and effective for high-dimensional data

**Usage:**
```python
from app.models import IsolationForestDetector

detector = IsolationForestDetector()
detector.train_model(X_train)
scores, labels = detector.predict(X_test)
```

---

### 3. LSTM (`lstm.py`)
**Type:** Temporal sequence anomaly detection
**Architecture:**
- LSTM(64, return_sequences=True)
- LSTM(32)
- Dense(16, ReLU)
- Dense(1, Sigmoid)

**How it works:**
- Processes sequences of 100 timesteps
- Captures temporal dependencies and patterns
- Outputs anomaly probability for each sequence

**Usage:**
```python
from app.models import LSTMDetector, create_sequences

# Create sequences from time-series data
X_seq, y_seq = create_sequences(X, y, sequence_length=100)

detector = LSTMDetector(input_dim=30, sequence_length=100)
detector.train_model(X_seq, y_seq, epochs=50)
detector.compute_threshold(X_val_seq)
scores, labels = detector.predict(X_test_seq)
```

---

### 4. Ensemble (`ensemble.py`)
**Type:** Weighted combination of multiple models
**Weights (configurable):**
- Autoencoder: 0.4
- Isolation Forest: 0.3
- LSTM: 0.3

**How it works:**
- Combines predictions from all three models
- Normalizes scores to [0,1] range
- Weighted average produces final anomaly score
- Classifies into alert levels: normal, warning, critical

**Alert Levels:**
- **Normal:** score < 0.3
- **Warning:** 0.3 ≤ score < 0.7
- **Critical:** score ≥ 0.7

**Usage:**
```python
from app.models import EnsembleDetector

# Load or create individual models
ensemble = EnsembleDetector(
    autoencoder=ae_detector,
    isolation_forest=if_detector,
    lstm=lstm_detector,
)

# Optional: adjust weights
ensemble.set_weights(autoencoder=0.5, isolation_forest=0.3, lstm=0.2)

# Make predictions
result = ensemble.predict(X_test, X_test_sequences)

print(f"Ensemble scores: {result['ensemble_scores']}")
print(f"Alert levels: {result['alert_levels']}")
print(f"Individual scores:")
print(f"  - Autoencoder: {result['autoencoder_scores']}")
print(f"  - Isolation Forest: {result['iforest_scores']}")
print(f"  - LSTM: {result['lstm_scores']}")
```

---

## Model Persistence

All models support save/load functionality:

```python
# Save
detector.save("models/detector_name/")

# Load
from app.models import AutoencoderDetector
detector = AutoencoderDetector.load("models/detector_name/")
```

Ensemble saves all models in subdirectories:
```
models/ensemble/
├── autoencoder/
├── isolation_forest/
├── lstm/
└── ensemble_config.npy
```

---

## Testing

Run tests for all models:
```bash
cd backend
python -m pytest tests/ -v
```

Run tests for specific model:
```bash
python -m pytest tests/test_autoencoder.py -v
python -m pytest tests/test_isolation_forest.py -v
python -m pytest tests/test_lstm.py -v
python -m pytest tests/test_ensemble.py -v
```

---

## Design Principles

1. **Consistent API:** All detectors follow the same interface pattern
   - `train_model()` - train the model
   - `predict()` - get (scores, labels)
   - `save()` / `load()` - persistence

2. **Modular:** Each model is independent and can be used separately

3. **Tested:** Comprehensive unit tests for all functionality

4. **Type-safe:** Uses type hints throughout

5. **Production-ready:** Includes error handling, validation, and logging hooks
