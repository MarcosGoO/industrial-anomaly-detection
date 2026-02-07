# Industrial Anomaly Detection API

FastAPI-based REST API for real-time anomaly detection in industrial machinery using ensemble ML models.

## Features

- **Real-time Predictions**: POST endpoint for anomaly detection on feature vectors
- **Health Monitoring**: GET endpoint for system and model status
- **Auto-generated Documentation**: Swagger UI and ReDoc
- **CORS Enabled**: Ready for frontend integration
- **Validated I/O**: Pydantic schemas for type-safe requests/responses

---

## Quick Start

### Installation

```bash
cd backend
pip install -r requirements.txt
```

### Run Server

```bash
# From backend directory
python -m app.main

# Or with uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at `http://localhost:8000`

---

## API Endpoints

### 1. Root (`GET /`)

Returns API information and status.

**Response:**
```json
{
  "name": "Industrial Anomaly Detection API",
  "version": "1.0.0",
  "status": "running",
  "docs": "/docs"
}
```

---

### 2. Predict (`POST /api/predict`)

Make anomaly predictions on feature vectors.

**Request Body:**
```json
{
  "features": [
    [0.1, 0.2, 0.3, ...],  // 30 features per sample
    [0.4, 0.5, 0.6, ...]
  ]
}
```

**Response:**
```json
{
  "predictions": [
    {
      "sample_index": 0,
      "ensemble_score": 0.25,
      "alert_level": "normal",
      "is_anomaly": false,
      "individual_scores": {
        "autoencoder": 0.15,
        "isolation_forest": 0.20,
        "lstm": 0.30
      }
    }
  ],
  "summary": {
    "total_samples": 1,
    "anomalies_detected": 0,
    "normal_count": 1,
    "warning_count": 0,
    "critical_count": 0,
    "avg_ensemble_score": 0.25
  }
}
```

**Alert Levels:**
- `normal`: score < 0.3
- `warning`: 0.3 ≤ score < 0.7
- `critical`: score ≥ 0.7

---

### 3. Health Check (`GET /api/health`)

Get system and model health status.

**Response:**
```json
{
  "status": "healthy",
  "models": [
    {
      "name": "autoencoder",
      "loaded": true,
      "threshold": 0.05
    },
    {
      "name": "isolation_forest",
      "loaded": true,
      "threshold": null
    },
    {
      "name": "lstm",
      "loaded": true,
      "threshold": 0.5
    }
  ],
  "ensemble_config": {
    "weights": {
      "autoencoder": 0.4,
      "isolation_forest": 0.3,
      "lstm": 0.3
    }
  }
}
```

**Status Values:**
- `healthy`: All models loaded
- `degraded`: Some models loaded
- `unhealthy`: No models loaded

---

### 4. Readiness Probe (`GET /api/ready`)

Simple endpoint for Kubernetes/Docker health checks.

**Response:**
```json
{
  "ready": true,
  "message": "Service is ready"
}
```

---

## Interactive Documentation

### Swagger UI
Visit `http://localhost:8000/docs` for interactive API documentation with a built-in testing interface.

### ReDoc
Visit `http://localhost:8000/redoc` for clean, readable API documentation.

### OpenAPI Schema
Download the OpenAPI schema at `http://localhost:8000/openapi.json`

---

## Usage Examples

### Python (requests)

```python
import requests
import numpy as np

# Generate sample features
features = np.random.randn(10, 30).tolist()

# Make prediction
response = requests.post(
    "http://localhost:8000/api/predict",
    json={"features": features}
)

result = response.json()
print(f"Anomalies detected: {result['summary']['anomalies_detected']}")

for pred in result['predictions']:
    if pred['is_anomaly']:
        print(f"Sample {pred['sample_index']}: {pred['alert_level']}")
```

### JavaScript (fetch)

```javascript
// Generate sample features
const features = Array.from({length: 10}, () =>
  Array.from({length: 30}, () => Math.random())
);

// Make prediction
const response = await fetch('http://localhost:8000/api/predict', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({features})
});

const result = await response.json();
console.log(`Anomalies: ${result.summary.anomalies_detected}`);
```

### cURL

```bash
curl -X POST "http://localhost:8000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "features": [
      [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0,
       1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0,
       2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0]
    ]
  }'
```

---

## Error Handling

All endpoints return structured error responses:

```json
{
  "detail": "Error message describing what went wrong",
  "error_type": "ValidationError"
}
```

**Common Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: Invalid input
- `503 Service Unavailable`: Models not loaded
- `500 Internal Server Error`: Unexpected error

---

## Model Loading

The API uses a singleton `InferenceService` to manage models. Models must be loaded before the API can make predictions.

### From Individual Models

```python
from app.services.inference_service import InferenceService

service = InferenceService()
service.load_models("path/to/models/directory")
```

### From Ensemble

```python
service = InferenceService()
service.load_from_ensemble("path/to/ensemble/directory")
```

---

## Testing

Run API tests:

```bash
cd backend
python -m pytest tests/test_api.py -v
```

**Test Coverage:**
- Root endpoint
- Health checks (with/without models)
- Readiness probe
- Prediction endpoint (valid/invalid inputs)
- API documentation endpoints

---

## Architecture

```
FastAPI Application
    ├── Routes
    │   ├── /api/predict → predict.py
    │   ├── /api/health → health.py
    │   └── /api/ready → health.py
    │
    ├── Services
    │   └── InferenceService (Singleton)
    │       ├── Manages model lifecycle
    │       └── Handles predictions
    │
    ├── Schemas (Pydantic)
    │   ├── PredictionRequest
    │   ├── PredictionResponse
    │   ├── HealthResponse
    │   └── ErrorResponse
    │
    └── Models
        ├── AutoencoderDetector
        ├── IsolationForestDetector
        ├── LSTMDetector
        └── EnsembleDetector
```

---

## Production Considerations

### Security
- **CORS**: Currently allows all origins (`*`). In production, specify exact origins:
  ```python
  allow_origins=["https://yourdomain.com"]
  ```
- **Rate Limiting**: Add rate limiting middleware for production
- **Authentication**: Consider adding API keys or OAuth for sensitive deployments

### Performance
- **Async Predictions**: For high throughput, use background tasks
- **Batch Processing**: API supports batch predictions (multiple samples)
- **Model Caching**: InferenceService uses singleton pattern to cache models

### Monitoring
- `/api/health` - Monitor model status
- `/api/ready` - Use for Kubernetes liveness/readiness probes
- Add logging middleware for request/response tracking

---

## Development

### Adding New Endpoints

1. Create route file in `app/api/routes/`
2. Define Pydantic schemas in `app/api/schemas.py`
3. Add router to `app/main.py`
4. Write tests in `tests/test_api.py`

### Example

```python
# app/api/routes/metrics.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/metrics")
async def get_metrics():
    return {"metric": "value"}
```

```python
# app/main.py
from app.api.routes import metrics

app.include_router(metrics.router, prefix="/api", tags=["metrics"])
```

---

## License

Part of the Industrial Anomaly Detection System project.
