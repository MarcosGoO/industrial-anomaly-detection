"""
Unit tests for LSTM anomaly detector.
"""

import tempfile
import shutil
import sys
from pathlib import Path
import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.models.lstm import LSTMDetector, create_sequences


class TestLSTMDetector:
    """Test suite for LSTMDetector."""

    @pytest.fixture
    def sample_sequences(self):
        """Generate sample sequential data."""
        np.random.seed(42)
        seq_length = 100
        n_features = 30
        n_samples = 500

        # Normal sequences: smooth trends
        normal = np.cumsum(np.random.randn(n_samples, seq_length, n_features) * 0.1, axis=1)
        # Anomalous sequences: sudden spikes
        anomalies = normal.copy()
        for i in range(len(anomalies)):
            spike_idx = np.random.randint(50, seq_length)
            anomalies[i, spike_idx:, :] += 10

        X = np.vstack([normal[:400], anomalies[:100]])
        y = np.array([0] * 400 + [1] * 100)
        return X, y

    def test_initialization(self):
        """Test detector initialization."""
        detector = LSTMDetector(input_dim=30, sequence_length=100)
        assert detector.input_dim == 30
        assert detector.sequence_length == 100
        assert detector.hidden_dim_1 == 64
        assert detector.hidden_dim_2 == 32
        assert detector.threshold is None

    def test_train_model(self, sample_sequences):
        """Test model training."""
        X, y = sample_sequences
        detector = LSTMDetector(input_dim=30, sequence_length=100)

        losses = detector.train_model(X, y, epochs=5, verbose=False)
        assert len(losses) == 5
        assert all(isinstance(loss, float) for loss in losses)

    def test_compute_threshold(self, sample_sequences):
        """Test threshold computation."""
        X, y = sample_sequences
        detector = LSTMDetector(input_dim=30, sequence_length=100)
        detector.train_model(X, y, epochs=5, verbose=False)

        threshold = detector.compute_threshold(X[:100])
        assert isinstance(threshold, float)
        assert 0 <= threshold <= 1
        assert detector.threshold == threshold

    def test_predict_before_threshold(self, sample_sequences):
        """Test that predict raises error before threshold is set."""
        X, y = sample_sequences
        detector = LSTMDetector(input_dim=30, sequence_length=100)
        detector.train_model(X, y, epochs=5, verbose=False)

        with pytest.raises(RuntimeError, match="Threshold not set"):
            detector.predict(X)

    def test_predict_output_shape(self, sample_sequences):
        """Test that predict returns correct output shapes."""
        X, y = sample_sequences
        detector = LSTMDetector(input_dim=30, sequence_length=100)
        detector.train_model(X, y, epochs=5, verbose=False)
        detector.compute_threshold(X[:100])

        scores, labels = detector.predict(X)

        assert scores.shape == (len(X),)
        assert labels.shape == (len(X),)
        assert np.all((labels == 0) | (labels == 1))
        assert np.all((scores >= 0) & (scores <= 1))

    def test_save_and_load(self, sample_sequences):
        """Test model persistence."""
        X, y = sample_sequences
        detector = LSTMDetector(input_dim=30, sequence_length=100)
        detector.train_model(X, y, epochs=5, verbose=False)
        detector.compute_threshold(X[:100])

        # Get predictions before saving
        scores_before, labels_before = detector.predict(X)

        # Save and load
        temp_dir = tempfile.mkdtemp()
        try:
            detector.save(temp_dir)
            loaded_detector = LSTMDetector.load(temp_dir)

            # Check configuration preserved
            assert loaded_detector.input_dim == 30
            assert loaded_detector.sequence_length == 100
            assert loaded_detector.threshold is not None

            # Check predictions match
            scores_after, labels_after = loaded_detector.predict(X)
            np.testing.assert_array_almost_equal(scores_before, scores_after, decimal=5)
            np.testing.assert_array_equal(labels_before, labels_after)

        finally:
            shutil.rmtree(temp_dir)


class TestCreateSequences:
    """Test suite for sequence creation utility."""

    def test_create_sequences_basic(self):
        """Test basic sequence creation."""
        X = np.arange(100).reshape(100, 1)
        X_seq, _ = create_sequences(X, sequence_length=10, stride=1)

        assert X_seq.shape == (91, 10, 1)
        # First sequence should be timesteps 0-9
        np.testing.assert_array_equal(X_seq[0], X[:10])

    def test_create_sequences_with_labels(self):
        """Test sequence creation with labels."""
        X = np.arange(100).reshape(100, 1)
        y = np.arange(100)
        X_seq, y_seq = create_sequences(X, y, sequence_length=10, stride=1)

        assert X_seq.shape == (91, 10, 1)
        assert y_seq.shape == (91,)
        # Label should be from last timestep of sequence
        assert y_seq[0] == 9

    def test_create_sequences_with_stride(self):
        """Test sequence creation with custom stride."""
        X = np.arange(100).reshape(100, 1)
        X_seq, _ = create_sequences(X, sequence_length=10, stride=5)

        assert X_seq.shape == (19, 10, 1)
        # First sequence: 0-9, second: 5-14, etc.
        np.testing.assert_array_equal(X_seq[0], X[:10])
        np.testing.assert_array_equal(X_seq[1], X[5:15])

    def test_create_sequences_multivariate(self):
        """Test sequence creation with multiple features."""
        X = np.random.randn(100, 30)
        X_seq, _ = create_sequences(X, sequence_length=20, stride=1)

        assert X_seq.shape == (81, 20, 30)
