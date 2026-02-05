# Industrial Anomaly Detection System - Project Brief

## 🎯 Project Overview

An **Industrial Anomaly Detection System** for predictive maintenance of rotating machinery (motors/pumps). The system uses an ensemble of ML models to detect anomalies in real-time from vibration and temperature sensors, predicts Remaining Useful Life (RUL), and provides explainable insights through an interactive dashboard.

**Target Use Case:** Manufacturing industry - bearing failure prediction  
**Deployment:** Edge device simulation (Raspberry Pi-ready architecture)  
**Tech Focus:** ML + Real-time processing + Interactive visualization

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DATA LAYER                            │
│  • NASA Bearing Dataset (real vibration data)           │
│  • Synthetic temperature generation                      │
│  • Data augmentation pipeline                           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              PROCESSING LAYER (Edge Simulator)           │
│                                                          │
│  Feature Extraction:                                     │
│  • FFT (frequency domain analysis)                       │
│  • Statistical features (RMS, kurtosis, skewness)       │
│  • Wavelet transforms                                    │
│                                                          │
│  ML Models (Ensemble):                                   │
│  • Autoencoder (reconstruction error)                    │
│  • Isolation Forest (outlier detection)                 │
│  • LSTM (temporal patterns)                              │
│                                                          │
│  Advanced Modules:                                       │
│  • Adaptive threshold system                             │
│  • Drift detection                                       │
│  • Explainability (SHAP)                                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│                  API LAYER (FastAPI)                     │
│  • POST /predict - Real-time inference                   │
│  • GET /health - Model metrics                           │
│  • POST /retrain - Trigger retraining                    │
│  • WebSocket /stream - Live data streaming               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│           VISUALIZATION LAYER (React + D3.js)            │
│                                                          │
│  Dashboards:                                             │
│  1. Real-Time Monitoring                                 │
│     - Live waveforms, spectrum, health score            │
│  2. Historical Analysis                                  │
│     - Trends, anomaly timeline, correlations            │
│  3. Anomaly Details                                      │
│     - Root cause, predictions, recommendations          │
│  4. System Performance                                   │
│     - Model metrics, inference stats, drift detection   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              PERSISTENCE LAYER                           │
│  • PostgreSQL - Metadata, configurations                 │
│  • TimescaleDB - Time-series data                        │
│  • Redis - Cache, real-time metrics                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
- **Python 3.11**
- **ML & Data Science:**
  - PyTorch (deep learning models)
  - Scikit-learn (Isolation Forest, preprocessing)
  - NumPy, Pandas (data manipulation)
  - SciPy (FFT, signal processing)
  - PyWavelets (wavelet transforms)
- **API & Services:**
  - FastAPI (REST + WebSockets)
  - Pydantic (data validation)
  - Celery (async tasks)
  - Redis (message broker)
- **Storage:**
  - PostgreSQL (metadata)
  - TimescaleDB (time-series)
  - SQLAlchemy (ORM)

### Frontend
- **React 18 + TypeScript**
- **Visualization:**
  - D3.js (custom charts)
  - Plotly.js (interactive plots)
  - Recharts (dashboards)
- **UI Components:**
  - Shadcn/ui (component library)
  - TailwindCSS (styling)
  - Framer Motion (animations)
- **State Management:**
  - React Query (data fetching)
  - Zustand (global state)
  - Socket.io-client (real-time)

### Infrastructure
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- Pytest (backend testing)
- Jest + React Testing Library (frontend testing)

---

## 📊 Dataset

**Primary:** [NASA IMS Bearing Dataset](https://www.nasa.gov/intelligent-systems-division/discovery-and-systems-health/pcoe/pcoe-data-set-repository/)
- 4 bearings running until failure
- Vibration sensors: 20 kHz sampling rate
- ~156 million data points per bearing
- Real industrial failure progression data

**Synthetic:** Temperature data correlated with vibration patterns

**Augmentation:** Multiple operating conditions (RPM, load, environment)

---

## 🧠 ML Models - Ensemble Approach

### Model 1: Autoencoder
```
Architecture:
Encoder: [128] → [64] → [32] → [16] (latent space)
Decoder: [16] → [32] → [64] → [128]

Detection Method:
- Anomaly score = reconstruction_error
- Dynamic threshold (95th percentile of normal data)
```

**Purpose:** Learn "normal" patterns, detect deviations

### Model 2: Isolation Forest
```
Parameters:
- n_estimators: 100
- contamination: 0.1
- max_samples: 256
```

**Purpose:** Fast outlier detection, complements Autoencoder

### Model 3: LSTM
```
Architecture:
Input: [sequence_length, features]
├── LSTM(64, return_sequences=True)
├── LSTM(32)
├── Dense(16, ReLU)
└── Dense(1, Sigmoid) → anomaly probability

Window: 100 timesteps (5 seconds @ 20Hz processed)
```

**Purpose:** Capture temporal dependencies, predict future failures

### Ensemble Decision
```python
final_score = (
    0.4 * autoencoder_score + 
    0.3 * isolation_forest_score + 
    0.3 * lstm_score
)

alert_level = {
    'normal': final_score < 0.3,
    'warning': 0.3 <= final_score < 0.7,
    'critical': final_score >= 0.7
}
```

---

## 🎯 Feature Engineering

### Time Domain Features (~10 features)
- RMS (Root Mean Square)
- Peak value
- Crest factor (peak/rms)
- Kurtosis (peakiness measure)
- Skewness (asymmetry)
- Standard deviation
- Energy (sum of squares)
- Mean absolute value
- Peak-to-peak
- Impulse factor

### Frequency Domain Features (~10 features)
Using FFT:
- Dominant frequency
- Spectral centroid (center of mass)
- Spectral rolloff (85% energy threshold)
- Spectral spread (variance)
- Band power in ranges:
  - 0-1 kHz
  - 1-2 kHz
  - 2-5 kHz
  - 5-10 kHz
- Frequency variance
- Spectral kurtosis

### Wavelet Domain Features (~10 features)
Using 4-level decomposition:
- Energy at detail levels 1-4
- Energy at approximation level 4
- Entropy measures
- Wavelet variance

**Total: ~30 features per time window**

---

## 🚀 Innovation Components

### 1. Adaptive Threshold System
Automatically adjusts detection thresholds based on:
- Historical performance (7-day rolling window)
- Current operating conditions
- False positive rate feedback
- True positive confirmation rate

### 2. Remaining Useful Life (RUL) Prediction
Projects time to failure using:
- Current health score
- Degradation rate calculation
- Historical trend analysis
- Confidence intervals

**Output:** "This bearing has ~72 hours before critical failure (87% confidence)"

### 3. Explainability Module
Identifies root causes using:
- SHAP values for feature importance
- Frequency band analysis
- Temporal pattern recognition

**Output:** "Anomaly caused by: Vibration spike at 2.4kHz (340% above baseline)"

### 4. Multi-Machine Transfer Learning
- Pretrain on Machine A data
- Fine-tune with minimal data from Machine B
- Reduces data requirements for new deployments

### 5. Drift Detection & Auto-Calibration
- Monitors data distribution changes
- Detects concept drift
- Recommends or triggers automatic retraining
- Maintains performance over time

---

## 📱 Dashboard Features

### Screen 1: Real-Time Monitoring
- Live vibration waveform (updating)
- Frequency spectrum (FFT)
- Current temperature reading
- Anomaly score gauge (0-1)
- Health status indicator
- RUL prediction display

### Screen 2: Historical Analysis
- Health score trend (last 30 days)
- Anomaly events timeline
- Feature correlation heatmap
- Performance degradation curve

### Screen 3: Anomaly Details
- Alert severity (Normal/Warning/Critical)
- Root cause analysis
- Contributing factors breakdown
- Frequency spectrum at anomaly time
- Recommended actions
- Similar past events

### Screen 4: System Performance
- Model metrics (Precision, Recall, F1)
- Inference performance (latency, throughput)
- Resource usage (CPU, memory)
- Drift detection status
- Confusion matrix
- Retraining recommendations

---

## 🗂️ Project Structure

```
industrial-anomaly-detection/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── predict.py
│   │   │   │   ├── health.py
│   │   │   │   └── metrics.py
│   │   │   └── websockets.py
│   │   ├── models/
│   │   │   ├── autoencoder.py
│   │   │   ├── isolation_forest.py
│   │   │   ├── lstm.py
│   │   │   └── ensemble.py
│   │   ├── preprocessing/
│   │   │   ├── feature_extraction.py
│   │   │   ├── signal_processing.py
│   │   │   └── normalization.py
│   │   └── services/
│   │       ├── inference_service.py
│   │       ├── training_service.py
│   │       └── drift_detection.py
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   │   ├── RealTimeMonitor.tsx
│   │   │   │   ├── HistoricalView.tsx
│   │   │   │   ├── AnomalyDetails.tsx
│   │   │   │   └── SystemMetrics.tsx
│   │   │   └── Visualizations/
│   │   │       ├── WaveformChart.tsx
│   │   │       ├── SpectrumChart.tsx
│   │   │       └── HealthGauge.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── websocket.ts
│   │   └── App.tsx
│   ├── package.json
│   └── Dockerfile
│
├── ml_pipeline/
│   ├── notebooks/
│   │   ├── 01_data_exploration.ipynb
│   │   ├── 02_feature_engineering.ipynb
│   │   ├── 03_model_training.ipynb
│   │   └── 04_model_evaluation.ipynb
│   └── scripts/
│       ├── download_data.py
│       ├── train_models.py
│       └── evaluate_models.py
│
├── infrastructure/
│   ├── docker-compose.yml
│   └── postgres-init.sql
│
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── USER_GUIDE.md
│
└── README.md
```

---

## 📅 Implementation Roadmap

### Sprint 1: Foundation (Week 1-2)
- [ ] Project setup (Git, Docker, folder structure)
- [ ] Download and explore NASA dataset
- [ ] Data preprocessing pipeline
- [ ] Feature extraction implementation
- [ ] Baseline Autoencoder model
- [ ] Initial training and evaluation

### Sprint 2: Core ML System (Week 3-4)
- [ ] Implement Isolation Forest model
- [ ] Implement LSTM model
- [ ] Create ensemble logic
- [ ] FastAPI backend setup
- [ ] Basic REST endpoints (/predict, /health)
- [ ] Unit tests for models and API

### Sprint 3: Frontend & Visualization (Week 5-6)
- [ ] React app setup with TypeScript
- [ ] Dashboard layout and navigation
- [ ] Real-time monitoring screen
- [ ] Waveform and spectrum charts (D3.js/Plotly)
- [ ] WebSocket integration
- [ ] API service layer

### Sprint 4: Advanced Features (Week 7-8)
- [ ] Adaptive threshold system
- [ ] Drift detection module
- [ ] Explainability (SHAP integration)
- [ ] RUL prediction algorithm
- [ ] Historical analysis screen
- [ ] Anomaly details screen

### Sprint 5: Polish & Deploy (Week 9-10)
- [ ] System performance metrics screen
- [ ] Complete dashboard styling
- [ ] Comprehensive documentation
- [ ] Docker Compose orchestration
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Demo video production
- [ ] README with badges and examples

---

## 📊 Success Metrics

### Technical Metrics
- [ ] Precision > 90%
- [ ] Recall > 85%
- [ ] False Positive Rate < 5%
- [ ] Inference latency < 50ms
- [ ] CPU usage < 40%
- [ ] Memory usage < 2GB

### Portfolio Metrics
- [ ] Professional README with badges
- [ ] High-quality demo video
- [ ] Complete API documentation
- [ ] Test coverage > 80%
- [ ] Working CI/CD pipeline
- [ ] One-command deployment

### Differentiators
- [ ] Adaptive learning implemented
- [ ] Explainability module working
- [ ] RUL prediction visualized
- [ ] Responsive dashboard
- [ ] Transfer learning demo

---

## 🎓 Learning Resources
### Signal Processing
- [Scipy FFT Documentation](https://docs.scipy.org/doc/scipy/reference/fft.html)
- [PyWavelets Tutorial](https://pywavelets.readthedocs.io/)
- Vibration analysis fundamentals

### ML for Time Series
- PyTorch LSTM tutorials
- Autoencoder for anomaly detection papers
- Isolation Forest scikit-learn docs

### Predictive Maintenance
- NASA Bearing Dataset papers
- RUL prediction methodologies
- Condition monitoring techniques

### Dashboard Development
- D3.js tutorials for real-time charts
- React Query for data fetching
- WebSocket integration patterns

---

## 🚀 Getting Started
When you're ready to implement, start with:

**"I want to begin Sprint 1 of the Industrial Anomaly Detection System. Please provide:**
1. **Complete project setup commands (folder structure)**
2. **Docker environment configuration**
3. **Script to download NASA bearing dataset**
4. **Initial data exploration notebook"**

Then proceed step-by-step through each sprint!

---

## 📝 Notes
- This is a **simulation-based project** - no physical hardware required
- Focus on **visual impact** for portfolio showcase
- Emphasize **production-ready** architecture and code quality
- Document everything for future reference
- Keep Git history clean with meaningful commits

---

**Project Duration:** 10 weeks (flexible)  
**Difficulty:** Intermediate to Advanced  
**Portfolio Impact:** High - demonstrates full-stack ML engineering skills