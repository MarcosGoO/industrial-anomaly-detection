"""
Normalization wrapper around scikit-learn's StandardScaler.

CRITICAL: The scaler must be fit ONLY on normal (non-anomalous) training data.
Fitting on data that includes anomalies will shift the mean / std and degrade
detection accuracy.
"""

from __future__ import annotations

import os

import joblib
import numpy as np
from sklearn.preprocessing import StandardScaler


class StandardNormalizer:
    """Thin, serialisable wrapper around StandardScaler.

    Usage
    -----
        normalizer = StandardNormalizer()
        X_train_scaled = normalizer.fit_transform(X_train)   # fit on normal data only
        X_test_scaled  = normalizer.transform(X_test)

        normalizer.save("scaler.joblib")
        loaded = StandardNormalizer.load("scaler.joblib")
    """

    def __init__(self):
        self._scaler = StandardScaler()
        self.is_fitted = False

    # ------------------------------------------------------------------
    # Core operations
    # ------------------------------------------------------------------
    def fit(self, X: np.ndarray) -> "StandardNormalizer":
        """Fit scaler statistics (mean, std) from X."""
        self._scaler.fit(X)
        self.is_fitted = True
        return self

    def transform(self, X: np.ndarray) -> np.ndarray:
        """Scale X using previously fitted statistics.  Raises if not fitted."""
        if not self.is_fitted:
            raise RuntimeError("Normalizer has not been fitted. Call fit() first.")
        return self._scaler.transform(X)

    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        """Fit and transform in one step."""
        self.fit(X)
        return self.transform(X)

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------
    def save(self, path: str) -> None:
        """Serialise the fitted scaler to disk via joblib."""
        os.makedirs(os.path.dirname(path) if os.path.dirname(path) else ".", exist_ok=True)
        joblib.dump(self._scaler, path)

    @classmethod
    def load(cls, path: str) -> "StandardNormalizer":
        """Deserialise a previously saved scaler."""
        obj = cls()
        obj._scaler = joblib.load(path)
        obj.is_fitted = True
        return obj
