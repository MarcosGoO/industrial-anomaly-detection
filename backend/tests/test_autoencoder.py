"""Unit tests for autoencoder.py — model, training, threshold, persistence."""

import os
import tempfile

import numpy as np
import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.models.autoencoder import Autoencoder, AnomalyDetector


# ---------------------------------------------------------------------------
# Autoencoder (nn.Module)
# ---------------------------------------------------------------------------
class TestAutoencoderModel:
    def test_output_shape(self):
        """Forward pass preserves input shape."""
        import torch
        model = Autoencoder(input_dim=30)
        x = torch.randn(16, 30)
        out = model(x)
        assert out.shape == (16, 30)

    def test_encode_shape(self):
        """Encoder maps to latent dim = 16."""
        import torch
        model = Autoencoder(input_dim=30)
        x = torch.randn(8, 30)
        latent = model.encode(x)
        assert latent.shape == (8, 16)

    def test_custom_input_dim(self):
        """Model accepts arbitrary input_dim."""
        import torch
        model = Autoencoder(input_dim=50)
        x = torch.randn(4, 50)
        out = model(x)
        assert out.shape == (4, 50)


# ---------------------------------------------------------------------------
# AnomalyDetector (wrapper)
# ---------------------------------------------------------------------------
class TestAnomalyDetector:
    @pytest.fixture
    def trained_detector(self):
        """Return a detector trained on 200 normal samples (tiny, fast)."""
        rng = np.random.default_rng(0)
        X_train = rng.standard_normal((200, 30)).astype(np.float32)
        detector = AnomalyDetector(input_dim=30)
        detector.train_model(X_train, epochs=5, verbose=False)
        detector.compute_threshold(X_train)
        return detector

    def test_train_returns_loss_list(self):
        rng = np.random.default_rng(1)
        X = rng.standard_normal((100, 30)).astype(np.float32)
        detector = AnomalyDetector(input_dim=30)
        losses = detector.train_model(X, epochs=3, verbose=False)
        assert len(losses) == 3
        # Loss should generally decrease (not guaranteed in 3 steps, but should be finite)
        assert all(np.isfinite(l) for l in losses)

    def test_threshold_is_positive(self, trained_detector):
        assert trained_detector.threshold is not None
        assert trained_detector.threshold > 0

    def test_predict_shapes(self, trained_detector):
        X_test = np.random.default_rng(2).standard_normal((50, 30)).astype(np.float32)
        scores, labels = trained_detector.predict(X_test)
        assert scores.shape == (50,)
        assert labels.shape == (50,)
        assert set(np.unique(labels)).issubset({0, 1})

    def test_predict_raises_without_threshold(self):
        detector = AnomalyDetector(input_dim=30)
        with pytest.raises(RuntimeError, match="Threshold not set"):
            detector.predict(np.zeros((5, 30), dtype=np.float32))

    def test_anomalous_samples_get_high_scores(self, trained_detector):
        """Samples far from training distribution should score higher on average."""
        rng = np.random.default_rng(3)
        X_normal  = rng.standard_normal((100, 30)).astype(np.float32) * 0.5
        X_anomaly = rng.standard_normal((100, 30)).astype(np.float32) * 50.0  # extreme outliers

        scores_n, _ = trained_detector.predict(X_normal)
        scores_a, _ = trained_detector.predict(X_anomaly)
        assert scores_a.mean() > scores_n.mean()


# ---------------------------------------------------------------------------
# Persistence (save / load)
# ---------------------------------------------------------------------------
class TestPersistence:
    def test_save_and_load(self, trained_detector=None):
        rng = np.random.default_rng(4)
        X = rng.standard_normal((80, 30)).astype(np.float32)
        det = AnomalyDetector(input_dim=30)
        det.train_model(X, epochs=3, verbose=False)
        det.compute_threshold(X)

        with tempfile.TemporaryDirectory() as tmpdir:
            det.save(tmpdir)
            loaded = AnomalyDetector.load(tmpdir)

            assert loaded.threshold == det.threshold
            assert loaded.input_dim == det.input_dim

            # Predictions must match
            scores_orig, labels_orig = det.predict(X)
            scores_load, labels_load = loaded.predict(X)
            np.testing.assert_array_almost_equal(scores_orig, scores_load, decimal=5)
            np.testing.assert_array_equal(labels_orig, labels_load)

    def test_saved_files_exist(self):
        det = AnomalyDetector(input_dim=30)
        X = np.random.default_rng(5).standard_normal((50, 30)).astype(np.float32)
        det.train_model(X, epochs=2, verbose=False)
        det.compute_threshold(X)

        with tempfile.TemporaryDirectory() as tmpdir:
            det.save(tmpdir)
            assert os.path.exists(os.path.join(tmpdir, "autoencoder_weights.pt"))
            assert os.path.exists(os.path.join(tmpdir, "autoencoder_meta.pt"))
