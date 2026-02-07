"""
Unit tests for Isolation Forest anomaly detector.
"""

import tempfile
import shutil
import sys
from pathlib import Path
import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.models.isolation_forest import IsolationForestDetector


class TestIsolationForestDetector:
    """Test suite for IsolationForestDetector."""

    @pytest.fixture
    def sample_data(self):
        """Generate sample normal and anomalous data."""
        np.random.seed(42)
        # Normal data: mean=0, std=1
        normal = np.random.randn(800, 30)
        # Anomalies: outliers with larger magnitude
        anomalies = np.random.randn(200, 30) * 5 + 10
        X = np.vstack([normal, anomalies])
        y = np.array([0] * 800 + [1] * 200)
        return X, y

    def test_initialization(self):
        """Test detector initialization with default parameters."""
        detector = IsolationForestDetector()
        assert detector.n_estimators == 100
        assert detector.contamination == 0.1
        assert detector.max_samples == 256
        assert not detector._is_fitted

    def test_train_model(self, sample_data):
        """Test model training."""
        X, _ = sample_data
        detector = IsolationForestDetector()

        assert not detector._is_fitted
        detector.train_model(X, verbose=False)
        assert detector._is_fitted

    def test_predict_before_training(self, sample_data):
        """Test that predict raises error before training."""
        X, _ = sample_data
        detector = IsolationForestDetector()

        with pytest.raises(RuntimeError, match="Model not trained"):
            detector.predict(X)

    def test_predict_output_shape(self, sample_data):
        """Test that predict returns correct output shapes."""
        X, _ = sample_data
        detector = IsolationForestDetector()
        detector.train_model(X, verbose=False)

        scores, labels = detector.predict(X)

        assert scores.shape == (len(X),)
        assert labels.shape == (len(X),)
        assert np.all((labels == 0) | (labels == 1))
        assert np.all((scores >= 0) & (scores <= 1))

    def test_decision_function(self, sample_data):
        """Test decision function output."""
        X, _ = sample_data
        detector = IsolationForestDetector()
        detector.train_model(X, verbose=False)

        decision_scores = detector.decision_function(X)
        assert decision_scores.shape == (len(X),)

    def test_save_and_load(self, sample_data):
        """Test model persistence."""
        X, _ = sample_data
        detector = IsolationForestDetector(n_estimators=50)
        detector.train_model(X, verbose=False)

        # Get predictions before saving
        scores_before, labels_before = detector.predict(X)

        # Save and load
        temp_dir = tempfile.mkdtemp()
        try:
            detector.save(temp_dir)
            loaded_detector = IsolationForestDetector.load(temp_dir)

            # Check configuration preserved
            assert loaded_detector.n_estimators == 50
            assert loaded_detector._is_fitted

            # Check predictions match
            scores_after, labels_after = loaded_detector.predict(X)
            np.testing.assert_array_almost_equal(scores_before, scores_after)
            np.testing.assert_array_equal(labels_before, labels_after)

        finally:
            shutil.rmtree(temp_dir)

    def test_anomaly_detection_capability(self, sample_data):
        """Test that model can detect obvious anomalies."""
        X, y = sample_data

        # Train only on normal data
        X_normal = X[y == 0]
        detector = IsolationForestDetector(contamination=0.2)
        detector.train_model(X_normal, verbose=False)

        # Test on mixed data
        scores, labels = detector.predict(X)

        # Anomalies should have higher scores than normal samples on average
        normal_scores = scores[y == 0]
        anomaly_scores = scores[y == 1]
        assert np.mean(anomaly_scores) > np.mean(normal_scores)
