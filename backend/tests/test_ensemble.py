"""
Unit tests for ensemble anomaly detector.
"""

import tempfile
import shutil
import sys
from pathlib import Path
import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.models.ensemble import EnsembleDetector
from app.models.autoencoder import AnomalyDetector as AutoencoderDetector
from app.models.isolation_forest import IsolationForestDetector
from app.models.lstm import LSTMDetector


class TestEnsembleDetector:
    """Test suite for EnsembleDetector."""

    @pytest.fixture
    def trained_models(self):
        """Create and train simple models for ensemble testing."""
        np.random.seed(42)

        # Generate simple data
        n_samples = 200
        n_features = 30
        seq_length = 50

        X_normal = np.random.randn(n_samples, n_features)
        X_sequences = np.random.randn(n_samples, seq_length, n_features)
        y = np.zeros(n_samples)

        # Train autoencoder
        ae = AutoencoderDetector(input_dim=n_features)
        ae.train_model(X_normal, epochs=5, verbose=False)
        ae.compute_threshold(X_normal, percentile=95)

        # Train isolation forest
        iforest = IsolationForestDetector()
        iforest.train_model(X_normal, verbose=False)

        # Train LSTM
        lstm = LSTMDetector(input_dim=n_features, sequence_length=seq_length)
        lstm.train_model(X_sequences, y, epochs=5, verbose=False)
        lstm.compute_threshold(X_sequences, percentile=50)

        return ae, iforest, lstm, X_normal, X_sequences

    def test_initialization_default_weights(self):
        """Test ensemble initialization with default weights."""
        ensemble = EnsembleDetector()
        assert ensemble.weight_autoencoder == 0.4
        assert ensemble.weight_isolation_forest == 0.3
        assert ensemble.weight_lstm == 0.3

    def test_initialization_custom_weights(self):
        """Test ensemble initialization with custom weights."""
        ensemble = EnsembleDetector(
            weight_autoencoder=0.5,
            weight_isolation_forest=0.3,
            weight_lstm=0.2,
        )
        assert ensemble.weight_autoencoder == 0.5
        assert ensemble.weight_isolation_forest == 0.3
        assert ensemble.weight_lstm == 0.2

    def test_invalid_weights(self):
        """Test that invalid weights raise an error."""
        with pytest.raises(ValueError, match="must sum to 1.0"):
            EnsembleDetector(
                weight_autoencoder=0.5,
                weight_isolation_forest=0.3,
                weight_lstm=0.3,
            )

    def test_set_weights(self):
        """Test updating ensemble weights."""
        ensemble = EnsembleDetector()
        ensemble.set_weights(autoencoder=0.6, isolation_forest=0.2, lstm=0.2)

        assert ensemble.weight_autoencoder == 0.6
        assert ensemble.weight_isolation_forest == 0.2
        assert ensemble.weight_lstm == 0.2

    def test_set_weights_invalid(self):
        """Test that invalid weight updates raise an error."""
        ensemble = EnsembleDetector()
        with pytest.raises(ValueError, match="must sum to 1.0"):
            ensemble.set_weights(autoencoder=0.5, isolation_forest=0.5, lstm=0.5)

    def test_predict_with_all_models(self, trained_models):
        """Test prediction with all three models."""
        ae, iforest, lstm, X, X_seq = trained_models

        ensemble = EnsembleDetector(
            autoencoder=ae,
            isolation_forest=iforest,
            lstm=lstm,
        )

        result = ensemble.predict(X, X_seq)

        # Check result structure
        assert "ensemble_scores" in result
        assert "ensemble_labels" in result
        assert "alert_levels" in result
        assert "autoencoder_scores" in result
        assert "iforest_scores" in result
        assert "lstm_scores" in result
        assert "weights" in result

        # Check shapes
        assert result["ensemble_scores"].shape == (len(X),)
        assert result["ensemble_labels"].shape == (len(X),)
        assert result["alert_levels"].shape == (len(X),)

        # Check score ranges
        assert np.all((result["ensemble_scores"] >= 0) & (result["ensemble_scores"] <= 1))
        assert np.all((result["ensemble_labels"] == 0) | (result["ensemble_labels"] == 1))

    def test_predict_with_autoencoder_only(self, trained_models):
        """Test prediction with only autoencoder."""
        ae, _, _, X, _ = trained_models

        ensemble = EnsembleDetector(
            autoencoder=ae,
            weight_autoencoder=1.0,
            weight_isolation_forest=0.0,
            weight_lstm=0.0,
        )

        result = ensemble.predict(X)

        assert result["autoencoder_scores"] is not None
        assert result["iforest_scores"] is None
        assert result["lstm_scores"] is None
        assert result["weights"]["autoencoder"] == 1.0

    def test_predict_lstm_without_sequences(self, trained_models):
        """Test that LSTM prediction fails without sequences."""
        ae, iforest, lstm, X, _ = trained_models

        ensemble = EnsembleDetector(autoencoder=ae, isolation_forest=iforest, lstm=lstm)

        with pytest.raises(ValueError, match="X_sequences required"):
            ensemble.predict(X)

    def test_alert_level_classification(self, trained_models):
        """Test alert level classification."""
        ae, iforest, lstm, X, X_seq = trained_models

        ensemble = EnsembleDetector(autoencoder=ae, isolation_forest=iforest, lstm=lstm)
        result = ensemble.predict(X, X_seq)

        alert_levels = result["alert_levels"]
        scores = result["ensemble_scores"]

        # Check alert level assignments
        for i, (score, level) in enumerate(zip(scores, alert_levels)):
            if score < 0.3:
                assert level == "normal"
            elif 0.3 <= score < 0.7:
                assert level == "warning"
            else:
                assert level == "critical"

    def test_save_and_load(self, trained_models):
        """Test ensemble persistence."""
        ae, iforest, lstm, X, X_seq = trained_models

        ensemble = EnsembleDetector(autoencoder=ae, isolation_forest=iforest, lstm=lstm)
        ensemble.set_weights(autoencoder=0.5, isolation_forest=0.3, lstm=0.2)

        # Get predictions before saving
        result_before = ensemble.predict(X, X_seq)

        # Save and load
        temp_dir = tempfile.mkdtemp()
        try:
            ensemble.save(temp_dir)
            loaded_ensemble = EnsembleDetector.load(temp_dir)

            # Check configuration preserved
            assert loaded_ensemble.weight_autoencoder == 0.5
            assert loaded_ensemble.weight_isolation_forest == 0.3
            assert loaded_ensemble.weight_lstm == 0.2

            # Check predictions match
            result_after = loaded_ensemble.predict(X, X_seq)
            np.testing.assert_array_almost_equal(
                result_before["ensemble_scores"],
                result_after["ensemble_scores"],
                decimal=5,
            )

        finally:
            shutil.rmtree(temp_dir)

    def test_get_model_summary(self, trained_models):
        """Test model summary generation."""
        ae, iforest, lstm, _, _ = trained_models

        ensemble = EnsembleDetector(autoencoder=ae, isolation_forest=iforest, lstm=lstm)
        summary = ensemble.get_model_summary()

        assert summary["models"]["autoencoder"] is True
        assert summary["models"]["isolation_forest"] is True
        assert summary["models"]["lstm"] is True
        assert summary["weights"]["autoencoder"] == 0.4
        assert summary["weights"]["isolation_forest"] == 0.3
        assert summary["weights"]["lstm"] == 0.3
