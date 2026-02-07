"""
Isolation Forest anomaly detector.

Uses scikit-learn's IsolationForest for fast outlier detection.
Complements the Autoencoder by providing a different perspective on anomalies.

Parameters (from PROJECT_BRIEF.md):
    - n_estimators: 100
    - contamination: 0.1
    - max_samples: 256

Anomaly scoring:
    score  = decision_function output (negated & normalized to [0,1])
    label  = 1 (anomaly) when predict() returns -1
"""

from __future__ import annotations

import os
from typing import Optional

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest


class IsolationForestDetector:
    """Train, evaluate, and persist an Isolation Forest anomaly detector.

    Typical workflow
    ----------------
        detector = IsolationForestDetector()
        detector.train_model(X_train)
        scores, labels = detector.predict(X_test)
        detector.save("model_dir/")
    """

    def __init__(
        self,
        n_estimators: int = 100,
        contamination: float = 0.1,
        max_samples: int = 256,
        random_state: int = 42,
    ):
        """Initialize Isolation Forest with specified parameters.

        Args:
            n_estimators:  number of isolation trees.
            contamination: expected proportion of outliers in dataset.
            max_samples:   number of samples to draw for each tree.
            random_state:  seed for reproducibility.
        """
        self.n_estimators = n_estimators
        self.contamination = contamination
        self.max_samples = max_samples
        self.random_state = random_state

        self.model = IsolationForest(
            n_estimators=n_estimators,
            contamination=contamination,
            max_samples=max_samples,
            random_state=random_state,
            n_jobs=-1,  # use all available cores
        )

        self._is_fitted = False

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------
    def train_model(self, X_train: np.ndarray, verbose: bool = True) -> None:
        """Fit the Isolation Forest on training data.

        Args:
            X_train: shape (n_samples, n_features) — can include some anomalies.
            verbose: print status messages.
        """
        if verbose:
            print(f"    Training Isolation Forest with {len(X_train)} samples...")

        self.model.fit(X_train)
        self._is_fitted = True

        if verbose:
            print(f"    Training complete.")

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------
    def predict(self, X: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        """Return (scores, labels) for each sample.

        scores: float array in [0,1]; higher = more anomalous.
        labels: int array; 1 = anomaly, 0 = normal.

        Raises RuntimeError if model has not been trained.
        """
        if not self._is_fitted:
            raise RuntimeError("Model not trained. Call train_model() first.")

        # Raw predictions: -1 = anomaly, 1 = normal
        raw_labels = self.model.predict(X)
        labels = (raw_labels == -1).astype(int)

        # Decision function: more negative = more anomalous
        # We convert to [0,1] scale where higher = more anomalous
        decision_scores = self.model.decision_function(X)
        scores = self._normalize_scores(decision_scores)

        return scores, labels

    def decision_function(self, X: np.ndarray) -> np.ndarray:
        """Return raw anomaly scores (more negative = more anomalous).

        Raises RuntimeError if model has not been trained.
        """
        if not self._is_fitted:
            raise RuntimeError("Model not trained. Call train_model() first.")
        return self.model.decision_function(X)

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------
    def save(self, directory: str) -> None:
        """Save model to <directory>/."""
        os.makedirs(directory, exist_ok=True)
        model_path = os.path.join(directory, "isolation_forest.joblib")
        joblib.dump(self.model, model_path)

        # Save metadata
        meta = {
            "n_estimators": self.n_estimators,
            "contamination": self.contamination,
            "max_samples": self.max_samples,
            "random_state": self.random_state,
            "is_fitted": self._is_fitted,
        }
        meta_path = os.path.join(directory, "isolation_forest_meta.joblib")
        joblib.dump(meta, meta_path)

    @classmethod
    def load(cls, directory: str) -> "IsolationForestDetector":
        """Reload a previously saved detector."""
        meta_path = os.path.join(directory, "isolation_forest_meta.joblib")
        meta = joblib.load(meta_path)

        detector = cls(
            n_estimators=meta["n_estimators"],
            contamination=meta["contamination"],
            max_samples=meta["max_samples"],
            random_state=meta["random_state"],
        )

        model_path = os.path.join(directory, "isolation_forest.joblib")
        detector.model = joblib.load(model_path)
        detector._is_fitted = meta["is_fitted"]

        return detector

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _normalize_scores(self, decision_scores: np.ndarray) -> np.ndarray:
        """Convert decision function output to [0,1] range.

        Decision function outputs are typically in range [-0.5, 0.5],
        with more negative values indicating anomalies.
        We negate and normalize to [0,1] where 1 = most anomalous.
        """
        # Negate so that higher = more anomalous
        negated = -decision_scores

        # Min-max normalization to [0,1]
        min_val = negated.min()
        max_val = negated.max()

        if max_val - min_val < 1e-10:  # avoid division by zero
            return np.zeros_like(negated)

        normalized = (negated - min_val) / (max_val - min_val)
        return normalized
