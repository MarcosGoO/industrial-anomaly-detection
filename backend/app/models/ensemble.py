"""
Ensemble anomaly detector combining multiple models.

Combines predictions from:
    - Autoencoder (reconstruction error)
    - Isolation Forest (outlier detection)
    - LSTM (temporal patterns)

Ensemble decision (from PROJECT_BRIEF.md):
    final_score = (
        0.4 * autoencoder_score +
        0.3 * isolation_forest_score +
        0.3 * lstm_score
    )

    alert_level = {
        'normal':   final_score < 0.3,
        'warning':  0.3 <= final_score < 0.7,
        'critical': final_score >= 0.7
    }
"""

from __future__ import annotations

import os
from typing import Optional, Literal

import numpy as np

from .autoencoder import AnomalyDetector as AutoencoderDetector
from .isolation_forest import IsolationForestDetector
from .lstm import LSTMDetector


AlertLevel = Literal["normal", "warning", "critical"]


class EnsembleDetector:
    """Combine multiple anomaly detectors for robust predictions.

    Typical workflow
    ----------------
        ensemble = EnsembleDetector()

        # Load or train individual models
        ensemble.autoencoder = AutoencoderDetector.load("models/autoencoder/")
        ensemble.isolation_forest = IsolationForestDetector.load("models/isolation_forest/")
        ensemble.lstm = LSTMDetector.load("models/lstm/")

        # Set weights (optional, defaults to PROJECT_BRIEF.md values)
        ensemble.set_weights(autoencoder=0.4, isolation_forest=0.3, lstm=0.3)

        # Make predictions
        result = ensemble.predict(X_test, X_test_sequences)
    """

    def __init__(
        self,
        autoencoder: Optional[AutoencoderDetector] = None,
        isolation_forest: Optional[IsolationForestDetector] = None,
        lstm: Optional[LSTMDetector] = None,
        weight_autoencoder: float = 0.4,
        weight_isolation_forest: float = 0.3,
        weight_lstm: float = 0.3,
    ):
        """Initialize ensemble with optional pre-trained models.

        Args:
            autoencoder:              trained AutoencoderDetector instance.
            isolation_forest:         trained IsolationForestDetector instance.
            lstm:                     trained LSTMDetector instance.
            weight_autoencoder:       weight for autoencoder scores.
            weight_isolation_forest:  weight for isolation forest scores.
            weight_lstm:              weight for LSTM scores.
        """
        self.autoencoder = autoencoder
        self.isolation_forest = isolation_forest
        self.lstm = lstm

        self.weight_autoencoder = weight_autoencoder
        self.weight_isolation_forest = weight_isolation_forest
        self.weight_lstm = weight_lstm

        # Validate weights sum to 1.0
        total_weight = weight_autoencoder + weight_isolation_forest + weight_lstm
        if not np.isclose(total_weight, 1.0):
            raise ValueError(
                f"Weights must sum to 1.0, got {total_weight}. "
                f"(autoencoder={weight_autoencoder}, "
                f"isolation_forest={weight_isolation_forest}, "
                f"lstm={weight_lstm})"
            )

    # ------------------------------------------------------------------
    # Configuration
    # ------------------------------------------------------------------
    def set_weights(
        self,
        autoencoder: float,
        isolation_forest: float,
        lstm: float,
    ) -> None:
        """Update ensemble weights.

        Args:
            autoencoder:       weight for autoencoder scores.
            isolation_forest:  weight for isolation forest scores.
            lstm:              weight for LSTM scores.

        Raises:
            ValueError if weights don't sum to 1.0.
        """
        total = autoencoder + isolation_forest + lstm
        if not np.isclose(total, 1.0):
            raise ValueError(f"Weights must sum to 1.0, got {total}")

        self.weight_autoencoder = autoencoder
        self.weight_isolation_forest = isolation_forest
        self.weight_lstm = lstm

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------
    def predict(
        self,
        X: np.ndarray,
        X_sequences: Optional[np.ndarray] = None,
    ) -> dict:
        """Run ensemble prediction on data.

        Args:
            X:            feature array, shape (n_samples, n_features)
            X_sequences:  sequence array for LSTM, shape (n_samples, seq_len, n_features)
                          Required if LSTM model is present.

        Returns:
            Dictionary with keys:
                - ensemble_scores:    final weighted scores, shape (n_samples,)
                - ensemble_labels:    binary labels (0=normal, 1=anomaly)
                - alert_levels:       'normal', 'warning', or 'critical'
                - autoencoder_scores: individual model scores (if available)
                - iforest_scores:     individual model scores (if available)
                - lstm_scores:        individual model scores (if available)
                - weights:            dict of weights used
        """
        n_samples = len(X)
        ensemble_scores = np.zeros(n_samples)
        active_weights = {}

        # Autoencoder predictions
        if self.autoencoder is not None:
            ae_scores, _ = self.autoencoder.predict(X)
            ae_scores_norm = self._normalize_scores(ae_scores)
            ensemble_scores += self.weight_autoencoder * ae_scores_norm
            active_weights["autoencoder"] = self.weight_autoencoder
        else:
            ae_scores = None

        # Isolation Forest predictions
        if self.isolation_forest is not None:
            if_scores, _ = self.isolation_forest.predict(X)
            # Isolation Forest already normalizes to [0,1]
            ensemble_scores += self.weight_isolation_forest * if_scores
            active_weights["isolation_forest"] = self.weight_isolation_forest
        else:
            if_scores = None

        # LSTM predictions
        if self.lstm is not None:
            if X_sequences is None:
                raise ValueError("X_sequences required when LSTM model is present")
            lstm_scores, _ = self.lstm.predict(X_sequences)
            # LSTM outputs are already in [0,1] from sigmoid
            ensemble_scores += self.weight_lstm * lstm_scores
            active_weights["lstm"] = self.weight_lstm
        else:
            lstm_scores = None

        # Generate labels and alert levels
        ensemble_labels = self._compute_labels(ensemble_scores)
        alert_levels = self._compute_alert_levels(ensemble_scores)

        return {
            "ensemble_scores": ensemble_scores,
            "ensemble_labels": ensemble_labels,
            "alert_levels": alert_levels,
            "autoencoder_scores": ae_scores,
            "iforest_scores": if_scores,
            "lstm_scores": lstm_scores,
            "weights": active_weights,
        }

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------
    def save(self, directory: str) -> None:
        """Save all models in subdirectories.

        Structure:
            directory/
                autoencoder/
                isolation_forest/
                lstm/
                ensemble_config.npy
        """
        os.makedirs(directory, exist_ok=True)

        if self.autoencoder is not None:
            ae_dir = os.path.join(directory, "autoencoder")
            self.autoencoder.save(ae_dir)

        if self.isolation_forest is not None:
            if_dir = os.path.join(directory, "isolation_forest")
            self.isolation_forest.save(if_dir)

        if self.lstm is not None:
            lstm_dir = os.path.join(directory, "lstm")
            self.lstm.save(lstm_dir)

        # Save ensemble configuration
        config = {
            "weight_autoencoder": self.weight_autoencoder,
            "weight_isolation_forest": self.weight_isolation_forest,
            "weight_lstm": self.weight_lstm,
            "has_autoencoder": self.autoencoder is not None,
            "has_isolation_forest": self.isolation_forest is not None,
            "has_lstm": self.lstm is not None,
        }
        config_path = os.path.join(directory, "ensemble_config.npy")
        np.save(config_path, config, allow_pickle=True)

    @classmethod
    def load(cls, directory: str) -> "EnsembleDetector":
        """Reload a previously saved ensemble."""
        config_path = os.path.join(directory, "ensemble_config.npy")
        config = np.load(config_path, allow_pickle=True).item()

        # Load individual models
        autoencoder = None
        if config["has_autoencoder"]:
            ae_dir = os.path.join(directory, "autoencoder")
            autoencoder = AutoencoderDetector.load(ae_dir)

        isolation_forest = None
        if config["has_isolation_forest"]:
            if_dir = os.path.join(directory, "isolation_forest")
            isolation_forest = IsolationForestDetector.load(if_dir)

        lstm = None
        if config["has_lstm"]:
            lstm_dir = os.path.join(directory, "lstm")
            lstm = LSTMDetector.load(lstm_dir)

        return cls(
            autoencoder=autoencoder,
            isolation_forest=isolation_forest,
            lstm=lstm,
            weight_autoencoder=config["weight_autoencoder"],
            weight_isolation_forest=config["weight_isolation_forest"],
            weight_lstm=config["weight_lstm"],
        )

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _compute_labels(self, scores: np.ndarray, threshold: float = 0.5) -> np.ndarray:
        """Convert scores to binary labels.

        Args:
            scores:    anomaly scores in [0,1]
            threshold: classification threshold

        Returns:
            binary labels: 0=normal, 1=anomaly
        """
        return (scores > threshold).astype(int)

    def _compute_alert_levels(self, scores: np.ndarray) -> np.ndarray:
        """Classify scores into alert levels.

        Args:
            scores: anomaly scores in [0,1]

        Returns:
            array of alert levels: 'normal', 'warning', or 'critical'
        """
        alert_levels = np.empty(len(scores), dtype=object)

        alert_levels[scores < 0.3] = "normal"
        alert_levels[(scores >= 0.3) & (scores < 0.7)] = "warning"
        alert_levels[scores >= 0.7] = "critical"

        return alert_levels

    def _normalize_scores(self, scores: np.ndarray) -> np.ndarray:
        """Normalize scores to [0,1] range using min-max scaling.

        Args:
            scores: raw anomaly scores

        Returns:
            normalized scores in [0,1]
        """
        min_val = scores.min()
        max_val = scores.max()

        if max_val - min_val < 1e-10:  # avoid division by zero
            return np.zeros_like(scores)

        normalized = (scores - min_val) / (max_val - min_val)
        return normalized

    # ------------------------------------------------------------------
    # Model management
    # ------------------------------------------------------------------
    def get_model_summary(self) -> dict:
        """Get summary of loaded models and configuration.

        Returns:
            Dictionary with model availability and weights.
        """
        return {
            "models": {
                "autoencoder": self.autoencoder is not None,
                "isolation_forest": self.isolation_forest is not None,
                "lstm": self.lstm is not None,
            },
            "weights": {
                "autoencoder": self.weight_autoencoder,
                "isolation_forest": self.weight_isolation_forest,
                "lstm": self.weight_lstm,
            },
        }
