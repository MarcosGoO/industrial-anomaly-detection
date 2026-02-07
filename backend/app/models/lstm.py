"""
LSTM-based temporal anomaly detector.

Architecture (from PROJECT_BRIEF.md):
    Input: [sequence_length, features]
    ├── LSTM(64, return_sequences=True)
    ├── LSTM(32)
    ├── Dense(16, ReLU)
    └── Dense(1, Sigmoid) → anomaly probability

Window: 100 timesteps (5 seconds @ 20Hz processed)

Purpose: Capture temporal dependencies and predict future failures.
"""

from __future__ import annotations

import os
from typing import Optional

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset


# ---------------------------------------------------------------------------
# Network definition
# ---------------------------------------------------------------------------
class LSTMNetwork(nn.Module):
    """Bidirectional LSTM for sequence-based anomaly detection."""

    def __init__(self, input_dim: int = 30, hidden_dim_1: int = 64, hidden_dim_2: int = 32):
        """Initialize LSTM network.

        Args:
            input_dim:     number of features per timestep.
            hidden_dim_1:  hidden units in first LSTM layer.
            hidden_dim_2:  hidden units in second LSTM layer.
        """
        super().__init__()

        self.lstm1 = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim_1,
            batch_first=True,
            bidirectional=False,  # unidirectional for real-time processing
        )

        self.lstm2 = nn.LSTM(
            input_size=hidden_dim_1,
            hidden_size=hidden_dim_2,
            batch_first=True,
            bidirectional=False,
        )

        self.fc1 = nn.Linear(hidden_dim_2, 16)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(16, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass.

        Args:
            x: shape (batch, sequence_length, features)

        Returns:
            anomaly probabilities: shape (batch, 1)
        """
        # LSTM layers
        lstm1_out, _ = self.lstm1(x)  # (batch, seq_len, hidden_1)
        lstm2_out, (h_n, _) = self.lstm2(lstm1_out)  # (batch, seq_len, hidden_2)

        # Use final hidden state
        final_hidden = h_n[-1]  # (batch, hidden_2)

        # Dense layers
        out = self.fc1(final_hidden)  # (batch, 16)
        out = self.relu(out)
        out = self.fc2(out)  # (batch, 1)
        out = self.sigmoid(out)

        return out


# ---------------------------------------------------------------------------
# High-level detector wrapper
# ---------------------------------------------------------------------------
class LSTMDetector:
    """Train, evaluate, and persist an LSTM-based anomaly detector.

    Typical workflow
    ----------------
        detector = LSTMDetector(input_dim=30, sequence_length=100)
        detector.train_model(X_train_sequences, y_train_labels)
        detector.compute_threshold(X_val_sequences, y_val_labels)
        scores, labels = detector.predict(X_test_sequences)
        detector.save("model_dir/")
    """

    def __init__(
        self,
        input_dim: int = 30,
        sequence_length: int = 100,
        hidden_dim_1: int = 64,
        hidden_dim_2: int = 32,
        device: Optional[str] = None,
    ):
        """Initialize LSTM detector.

        Args:
            input_dim:        number of features per timestep.
            sequence_length:  number of timesteps in each sequence.
            hidden_dim_1:     hidden units in first LSTM layer.
            hidden_dim_2:     hidden units in second LSTM layer.
            device:           'cuda' or 'cpu'; auto-detected if None.
        """
        self.input_dim = input_dim
        self.sequence_length = sequence_length
        self.hidden_dim_1 = hidden_dim_1
        self.hidden_dim_2 = hidden_dim_2
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")

        self.model = LSTMNetwork(input_dim, hidden_dim_1, hidden_dim_2).to(self.device)
        self.threshold: Optional[float] = None

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------
    def train_model(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        epochs: int = 50,
        lr: float = 1e-3,
        batch_size: int = 64,
        verbose: bool = True,
    ) -> list[float]:
        """Train on sequential data.

        Args:
            X_train:    shape (n_samples, sequence_length, input_dim)
            y_train:    shape (n_samples,) with binary labels (0=normal, 1=anomaly)
            epochs:     number of training epochs.
            lr:         Adam learning rate.
            batch_size: mini-batch size.
            verbose:    print loss every 5 epochs.

        Returns:
            List of per-epoch average losses.
        """
        self.model.train()

        tensor_X = torch.tensor(X_train, dtype=torch.float32, device=self.device)
        tensor_y = torch.tensor(y_train, dtype=torch.float32, device=self.device).unsqueeze(1)

        dataset = TensorDataset(tensor_X, tensor_y)
        loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

        optimizer = torch.optim.Adam(self.model.parameters(), lr=lr)
        criterion = nn.BCELoss()  # Binary Cross-Entropy for anomaly classification
        losses: list[float] = []

        for epoch in range(epochs):
            epoch_loss = 0.0
            for batch_x, batch_y in loader:
                optimizer.zero_grad()
                predictions = self.model(batch_x)
                loss = criterion(predictions, batch_y)
                loss.backward()
                optimizer.step()
                epoch_loss += loss.item() * len(batch_x)

            avg_loss = epoch_loss / len(X_train)
            losses.append(avg_loss)

            if verbose and (epoch + 1) % 5 == 0:
                print(f"    Epoch {epoch+1:>4d}/{epochs}  loss={avg_loss:.6f}")

        return losses

    # ------------------------------------------------------------------
    # Threshold computation
    # ------------------------------------------------------------------
    def compute_threshold(
        self,
        X_val: np.ndarray,
        y_val: Optional[np.ndarray] = None,
        percentile: float = 50.0,
    ) -> float:
        """Set threshold based on validation data.

        Args:
            X_val:      validation sequences, shape (n_samples, sequence_length, input_dim)
            y_val:      optional labels for validation (not used currently)
            percentile: percentile of scores to use as threshold.

        Returns:
            The computed threshold value.
        """
        scores = self._get_anomaly_scores(X_val)
        self.threshold = float(np.percentile(scores, percentile))
        return self.threshold

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------
    def predict(self, X: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        """Return (scores, labels) for each sequence.

        scores: float array of anomaly probabilities in [0,1].
        labels: int array; 1 = anomaly, 0 = normal.

        Raises RuntimeError if threshold has not been computed.
        """
        if self.threshold is None:
            raise RuntimeError("Threshold not set. Call compute_threshold() first.")

        scores = self._get_anomaly_scores(X)
        labels = (scores > self.threshold).astype(int)
        return scores, labels

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------
    def save(self, directory: str) -> None:
        """Save model weights and metadata to <directory>/."""
        os.makedirs(directory, exist_ok=True)

        torch.save(
            self.model.state_dict(),
            os.path.join(directory, "lstm_weights.pt")
        )

        meta = {
            "input_dim": self.input_dim,
            "sequence_length": self.sequence_length,
            "hidden_dim_1": self.hidden_dim_1,
            "hidden_dim_2": self.hidden_dim_2,
            "threshold": self.threshold,
        }
        torch.save(meta, os.path.join(directory, "lstm_meta.pt"))

    @classmethod
    def load(cls, directory: str) -> "LSTMDetector":
        """Reload a previously saved detector."""
        meta = torch.load(
            os.path.join(directory, "lstm_meta.pt"),
            map_location="cpu"
        )

        detector = cls(
            input_dim=meta["input_dim"],
            sequence_length=meta["sequence_length"],
            hidden_dim_1=meta["hidden_dim_1"],
            hidden_dim_2=meta["hidden_dim_2"],
        )

        detector.model.load_state_dict(
            torch.load(
                os.path.join(directory, "lstm_weights.pt"),
                map_location="cpu"
            )
        )
        detector.threshold = meta["threshold"]

        return detector

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _get_anomaly_scores(self, X: np.ndarray) -> np.ndarray:
        """Get anomaly probability scores for sequences.

        Args:
            X: shape (n_samples, sequence_length, input_dim)

        Returns:
            anomaly scores: shape (n_samples,)
        """
        self.model.eval()
        with torch.no_grad():
            tensor_X = torch.tensor(X, dtype=torch.float32, device=self.device)
            predictions = self.model(tensor_X)
            scores = predictions.squeeze().cpu().numpy()

        # Ensure scores is 1D array
        if scores.ndim == 0:
            scores = np.array([scores])

        return scores


# ---------------------------------------------------------------------------
# Sequence creation utility
# ---------------------------------------------------------------------------
def create_sequences(
    X: np.ndarray,
    y: Optional[np.ndarray] = None,
    sequence_length: int = 100,
    stride: int = 1,
) -> tuple[np.ndarray, Optional[np.ndarray]]:
    """Create overlapping sequences from time-series data.

    Args:
        X:               shape (n_timesteps, n_features)
        y:               optional labels, shape (n_timesteps,)
        sequence_length: number of timesteps per sequence.
        stride:          step size between sequences.

    Returns:
        X_seq: shape (n_sequences, sequence_length, n_features)
        y_seq: shape (n_sequences,) if y provided, else None
               Label is taken from the LAST timestep of each sequence.
    """
    n_timesteps, n_features = X.shape
    sequences = []
    labels = [] if y is not None else None

    for i in range(0, n_timesteps - sequence_length + 1, stride):
        seq = X[i : i + sequence_length]
        sequences.append(seq)

        if y is not None:
            # Label is from the last timestep in the sequence
            labels.append(y[i + sequence_length - 1])

    X_seq = np.array(sequences)
    y_seq = np.array(labels) if labels is not None else None

    return X_seq, y_seq
