"""
Inference service for managing models and predictions.

This service handles loading models, making predictions, and managing
the ensemble detector lifecycle.
"""

import os
from typing import Optional, Dict, Any
import numpy as np

from app.models import (
    EnsembleDetector,
    AutoencoderDetector,
    IsolationForestDetector,
    LSTMDetector,
)


class InferenceService:
    """Service for managing anomaly detection models and predictions.

    This is a singleton service that loads models on initialization
    and provides prediction capabilities through the API.
    """

    _instance: Optional["InferenceService"] = None

    def __new__(cls):
        """Singleton pattern to ensure only one instance exists."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        """Initialize the inference service."""
        if self._initialized:
            return

        self.ensemble: Optional[EnsembleDetector] = None
        self.models_loaded = False
        self._initialized = True

    def load_models(self, models_dir: str = "models") -> None:
        """Load trained models from disk.

        Args:
            models_dir: Directory containing saved models.

        Raises:
            FileNotFoundError: If model files are not found.
        """
        # Check if models directory exists
        if not os.path.exists(models_dir):
            raise FileNotFoundError(f"Models directory not found: {models_dir}")

        # Load individual models
        autoencoder = None
        isolation_forest = None
        lstm = None

        ae_path = os.path.join(models_dir, "autoencoder")
        if os.path.exists(ae_path):
            autoencoder = AutoencoderDetector.load(ae_path)

        if_path = os.path.join(models_dir, "isolation_forest")
        if os.path.exists(if_path):
            isolation_forest = IsolationForestDetector.load(if_path)

        lstm_path = os.path.join(models_dir, "lstm")
        if os.path.exists(lstm_path):
            lstm = LSTMDetector.load(lstm_path)

        # Create ensemble
        self.ensemble = EnsembleDetector(
            autoencoder=autoencoder,
            isolation_forest=isolation_forest,
            lstm=lstm,
        )

        self.models_loaded = True

    def load_from_ensemble(self, ensemble_dir: str) -> None:
        """Load complete ensemble from disk.

        Args:
            ensemble_dir: Directory containing saved ensemble.
        """
        self.ensemble = EnsembleDetector.load(ensemble_dir)
        self.models_loaded = True

    def predict(
        self,
        features: np.ndarray,
        sequences: Optional[np.ndarray] = None,
    ) -> Dict[str, Any]:
        """Make predictions on feature data.

        Args:
            features: Feature array of shape (n_samples, n_features).
            sequences: Optional sequence array for LSTM (n_samples, seq_len, n_features).

        Returns:
            Dictionary containing predictions and metadata.

        Raises:
            RuntimeError: If models are not loaded.
            ValueError: If input shape is invalid.
        """
        if not self.models_loaded or self.ensemble is None:
            raise RuntimeError("Models not loaded. Call load_models() first.")

        # Validate input shape
        if features.ndim != 2:
            raise ValueError(
                f"Features must be 2D array, got shape {features.shape}"
            )

        # Make predictions
        result = self.ensemble.predict(features, sequences)

        # Format response
        predictions = []
        for i in range(len(features)):
            pred = {
                "sample_index": i,
                "ensemble_score": float(result["ensemble_scores"][i]),
                "alert_level": str(result["alert_levels"][i]),
                "is_anomaly": bool(result["ensemble_labels"][i]),
                "individual_scores": {},
            }

            # Add individual model scores if available
            if result["autoencoder_scores"] is not None:
                pred["individual_scores"]["autoencoder"] = float(
                    result["autoencoder_scores"][i]
                )
            if result["iforest_scores"] is not None:
                pred["individual_scores"]["isolation_forest"] = float(
                    result["iforest_scores"][i]
                )
            if result["lstm_scores"] is not None:
                pred["individual_scores"]["lstm"] = float(
                    result["lstm_scores"][i]
                )

            predictions.append(pred)

        # Compute summary statistics
        alert_levels = result["alert_levels"]
        summary = {
            "total_samples": len(features),
            "anomalies_detected": int(result["ensemble_labels"].sum()),
            "normal_count": int((alert_levels == "normal").sum()),
            "warning_count": int((alert_levels == "warning").sum()),
            "critical_count": int((alert_levels == "critical").sum()),
            "avg_ensemble_score": float(result["ensemble_scores"].mean()),
        }

        return {
            "predictions": predictions,
            "summary": summary,
        }

    def get_health_status(self) -> Dict[str, Any]:
        """Get health status of loaded models.

        Returns:
            Dictionary containing model health information.
        """
        if not self.models_loaded or self.ensemble is None:
            return {
                "status": "unhealthy",
                "models": [],
                "ensemble_config": {},
            }

        # Get model summary
        summary = self.ensemble.get_model_summary()

        models = []

        # Autoencoder status
        if summary["models"]["autoencoder"]:
            models.append({
                "name": "autoencoder",
                "loaded": True,
                "threshold": self.ensemble.autoencoder.threshold,
            })

        # Isolation Forest status
        if summary["models"]["isolation_forest"]:
            models.append({
                "name": "isolation_forest",
                "loaded": True,
                "threshold": None,  # Isolation Forest uses internal threshold
            })

        # LSTM status
        if summary["models"]["lstm"]:
            models.append({
                "name": "lstm",
                "loaded": True,
                "threshold": self.ensemble.lstm.threshold,
            })

        # Determine overall health
        loaded_count = len(models)
        if loaded_count == 3:
            status = "healthy"
        elif loaded_count > 0:
            status = "degraded"
        else:
            status = "unhealthy"

        return {
            "status": status,
            "models": models,
            "ensemble_config": {"weights": summary["weights"]},
        }

    def is_ready(self) -> bool:
        """Check if service is ready to handle requests.

        Returns:
            True if models are loaded, False otherwise.
        """
        return self.models_loaded and self.ensemble is not None
