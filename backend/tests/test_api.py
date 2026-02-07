"""
Unit tests for FastAPI endpoints.
"""

import sys
from pathlib import Path
import numpy as np
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app
from app.services.inference_service import InferenceService
from app.models import (
    AutoencoderDetector,
    IsolationForestDetector,
    LSTMDetector,
)

@pytest.fixture(scope="module")
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def reset_service():
    """Reset inference service for tests that need empty state."""
    inference_service = InferenceService()
    prev_loaded = inference_service.models_loaded
    prev_ensemble = inference_service.ensemble

    inference_service.models_loaded = False
    inference_service.ensemble = None

    yield

    inference_service.models_loaded = prev_loaded
    inference_service.ensemble = prev_ensemble


@pytest.fixture(scope="module", autouse=False)
def setup_test_models():
    """Setup test models for API testing."""
    # Store previous state
    inference_service = InferenceService()
    prev_loaded = inference_service.models_loaded
    prev_ensemble = inference_service.ensemble

    np.random.seed(42)
    n_samples = 200
    n_features = 30
    seq_length = 50

    # Generate test data
    X_train = np.random.randn(n_samples, n_features)
    X_sequences = np.random.randn(n_samples, seq_length, n_features)
    y = np.zeros(n_samples)

    # Train simple models
    ae = AutoencoderDetector(input_dim=n_features)
    ae.train_model(X_train, epochs=2, verbose=False)
    ae.compute_threshold(X_train, percentile=95)

    iforest = IsolationForestDetector()
    iforest.train_model(X_train, verbose=False)

    lstm = LSTMDetector(input_dim=n_features, sequence_length=seq_length)
    lstm.train_model(X_sequences, y, epochs=2, verbose=False)
    lstm.compute_threshold(X_sequences, percentile=50)

    # Load models into inference service
    from app.models import EnsembleDetector
    inference_service.ensemble = EnsembleDetector(
        autoencoder=ae,
        isolation_forest=iforest,
        lstm=lstm,
    )
    inference_service.models_loaded = True

    yield inference_service

    # Restore previous state
    inference_service.models_loaded = prev_loaded
    inference_service.ensemble = prev_ensemble


class TestRootEndpoint:
    """Tests for root endpoint."""

    def test_root(self, client):
        """Test root endpoint returns API info."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data
        assert "status" in data
        assert data["status"] == "running"


class TestHealthEndpoint:
    """Tests for health check endpoints."""

    def test_health_without_models(self, client, reset_service):
        """Test health endpoint when models are not loaded."""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "unhealthy"
        assert len(data["models"]) == 0

    def test_health_with_models(self, client, setup_test_models):
        """Test health endpoint when models are loaded."""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()

        assert data["status"] == "healthy"
        assert len(data["models"]) == 3

        # Check model names
        model_names = {m["name"] for m in data["models"]}
        assert "autoencoder" in model_names
        assert "isolation_forest" in model_names
        assert "lstm" in model_names

        # Check ensemble config
        assert "ensemble_config" in data
        assert "weights" in data["ensemble_config"]

    def test_ready_endpoint_not_ready(self, client, reset_service):
        """Test ready endpoint when service is not ready."""
        response = client.get("/api/ready")
        assert response.status_code == 200
        data = response.json()
        assert data["ready"] is False

    def test_ready_endpoint_ready(self, client, setup_test_models):
        """Test ready endpoint when service is ready."""
        response = client.get("/api/ready")
        assert response.status_code == 200
        data = response.json()
        assert data["ready"] is True


class TestPredictEndpoint:
    """Tests for prediction endpoint."""

    def test_predict_without_models(self, client, reset_service):
        """Test predict endpoint fails when models not loaded."""
        payload = {"features": [[0.0] * 30]}
        response = client.post("/api/predict", json=payload)
        assert response.status_code == 503

    def test_predict_with_valid_input(self, client, setup_test_models):
        """Test predict endpoint with valid input."""
        payload = {
            "features": [
                [0.1] * 30,
                [0.2] * 30,
            ]
        }
        response = client.post("/api/predict", json=payload)
        if response.status_code != 200:
            print(f"Error response: {response.json()}")
        assert response.status_code == 200

        data = response.json()
        assert "predictions" in data
        assert "summary" in data

        # Check predictions
        predictions = data["predictions"]
        assert len(predictions) == 2

        for pred in predictions:
            assert "sample_index" in pred
            assert "ensemble_score" in pred
            assert "alert_level" in pred
            assert "is_anomaly" in pred
            assert "individual_scores" in pred

            # Check score ranges
            assert 0 <= pred["ensemble_score"] <= 1
            assert pred["alert_level"] in ["normal", "warning", "critical"]
            assert isinstance(pred["is_anomaly"], bool)

        # Check summary
        summary = data["summary"]
        assert summary["total_samples"] == 2
        assert "anomalies_detected" in summary
        assert "normal_count" in summary
        assert "warning_count" in summary
        assert "critical_count" in summary
        assert "avg_ensemble_score" in summary

    def test_predict_with_invalid_shape(self, client, setup_test_models):
        """Test predict endpoint with invalid input shape."""
        # 1D array instead of 2D
        payload = {"features": [0.0] * 30}
        response = client.post("/api/predict", json=payload)
        assert response.status_code == 422  # Validation error

    def test_predict_with_wrong_feature_count(self, client, setup_test_models):
        """Test predict endpoint with wrong number of features."""
        payload = {"features": [[0.0] * 20]}  # Wrong number of features
        response = client.post("/api/predict", json=payload)
        # This might pass validation but fail in prediction
        # depending on how the model handles it
        assert response.status_code in [400, 500]

    def test_predict_single_sample(self, client, setup_test_models):
        """Test predict endpoint with single sample."""
        payload = {"features": [[0.15] * 30]}
        response = client.post("/api/predict", json=payload)
        assert response.status_code == 200

        data = response.json()
        assert len(data["predictions"]) == 1
        assert data["summary"]["total_samples"] == 1

    def test_predict_batch(self, client, setup_test_models):
        """Test predict endpoint with batch of samples."""
        payload = {"features": [[float(i) * 0.1] * 30 for i in range(10)]}
        response = client.post("/api/predict", json=payload)
        assert response.status_code == 200

        data = response.json()
        assert len(data["predictions"]) == 10
        assert data["summary"]["total_samples"] == 10


class TestAPIDocumentation:
    """Tests for API documentation endpoints."""

    def test_openapi_schema(self, client):
        """Test OpenAPI schema is accessible."""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        schema = response.json()
        assert "openapi" in schema
        assert "info" in schema
        assert "paths" in schema

    def test_docs_endpoint(self, client):
        """Test Swagger UI docs are accessible."""
        response = client.get("/docs")
        assert response.status_code == 200

    def test_redoc_endpoint(self, client):
        """Test ReDoc docs are accessible."""
        response = client.get("/redoc")
        assert response.status_code == 200
