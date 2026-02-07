"""
Anomaly detection models for industrial machinery monitoring.

Available models:
    - AutoencoderDetector:       reconstruction-based anomaly detection
    - IsolationForestDetector:   fast outlier detection
    - LSTMDetector:              temporal pattern anomaly detection
    - EnsembleDetector:          weighted combination of all models
"""

from .autoencoder import AnomalyDetector as AutoencoderDetector, Autoencoder
from .isolation_forest import IsolationForestDetector
from .lstm import LSTMDetector, LSTMNetwork, create_sequences
from .ensemble import EnsembleDetector, AlertLevel

__all__ = [
    # Autoencoder
    "AutoencoderDetector",
    "Autoencoder",
    # Isolation Forest
    "IsolationForestDetector",
    # LSTM
    "LSTMDetector",
    "LSTMNetwork",
    "create_sequences",
    # Ensemble
    "EnsembleDetector",
    "AlertLevel",
]
