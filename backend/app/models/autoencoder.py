"""
Autoencoder-based anomaly detector.

Architecture (parameterised on input_dim, default 30 to match feature count):
    Encoder:  input_dim → 128 → 64 → 32 → 16
    Decoder:  16 → 32 → 64 → 128 → input_dim

Anomaly scoring:
    score  = mean squared reconstruction error per sample
    label  = 1 (anomaly) when score > threshold
    threshold = 95th percentile of scores on normal validation data
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
class Autoencoder(nn.Module):
    """Symmetric encoder-decoder with ReLU activations."""

    def __init__(self, input_dim: int = 30):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 128), nn.ReLU(),
            nn.Linear(128, 64),        nn.ReLU(),
            nn.Linear(64, 32),         nn.ReLU(),
            nn.Linear(32, 16),         nn.ReLU(),
        )
        self.decoder = nn.Sequential(
            nn.Linear(16, 32),         nn.ReLU(),
            nn.Linear(32, 64),         nn.ReLU(),
            nn.Linear(64, 128),        nn.ReLU(),
            nn.Linear(128, input_dim),              # no activation — output is unbounded
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        latent = self.encoder(x)
        return self.decoder(latent)

    def encode(self, x: torch.Tensor) -> torch.Tensor:
        """Return latent representation only."""
        return self.encoder(x)


# ---------------------------------------------------------------------------
# High-level detector wrapper
# ---------------------------------------------------------------------------
class AnomalyDetector:
    """Train, evaluate, and persist an Autoencoder-based anomaly detector.

    Typical workflow
    ----------------
        detector = AnomalyDetector(input_dim=30)
        detector.train_model(X_train_normal)
        detector.compute_threshold(X_val_normal)
        scores, labels = detector.predict(X_test)
        detector.save("model_dir/")
    """

    def __init__(self, input_dim: int = 30, device: Optional[str] = None):
        self.input_dim = input_dim
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.model = Autoencoder(input_dim).to(self.device)
        self.threshold: Optional[float] = None

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------
    def train_model(
        self,
        X_train: np.ndarray,
        epochs: int = 100,
        lr: float = 1e-3,
        batch_size: int = 256,
        verbose: bool = True,
    ) -> list[float]:
        """Train on normalised normal-phase data.

        Args:
            X_train:    shape (n_samples, input_dim) — MUST be normal data only.
            epochs:     number of training epochs.
            lr:         Adam learning rate.
            batch_size: mini-batch size.
            verbose:    print loss every 10 epochs.

        Returns:
            List of per-epoch average losses.
        """
        self.model.train()
        tensor_X = torch.tensor(X_train, dtype=torch.float32, device=self.device)
        dataset = TensorDataset(tensor_X, tensor_X)  # input == target (reconstruction)
        loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

        optimizer = torch.optim.Adam(self.model.parameters(), lr=lr)
        criterion = nn.MSELoss()
        losses: list[float] = []

        for epoch in range(epochs):
            epoch_loss = 0.0
            for batch_x, batch_y in loader:
                optimizer.zero_grad()
                recon = self.model(batch_x)
                loss = criterion(recon, batch_y)
                loss.backward()
                optimizer.step()
                epoch_loss += loss.item() * len(batch_x)

            avg_loss = epoch_loss / len(X_train)
            losses.append(avg_loss)
            if verbose and (epoch + 1) % 10 == 0:
                print(f"    Epoch {epoch+1:>4d}/{epochs}  loss={avg_loss:.6f}")

        return losses

    # ------------------------------------------------------------------
    # Threshold computation
    # ------------------------------------------------------------------
    def compute_threshold(self, X_val_normal: np.ndarray, percentile: float = 95.0) -> float:
        """Set threshold as the <percentile>-th percentile of reconstruction errors
        computed on normal validation data.

        MUST be called after training and before predict().
        """
        scores = self._reconstruction_errors(X_val_normal)
        self.threshold = float(np.percentile(scores, percentile))
        return self.threshold

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------
    def predict(self, X: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        """Return (scores, labels) for each sample.

        scores: float array of reconstruction errors.
        labels: int array; 1 = anomaly, 0 = normal.

        Raises RuntimeError if threshold has not been computed.
        """
        if self.threshold is None:
            raise RuntimeError("Threshold not set. Call compute_threshold() first.")
        scores = self._reconstruction_errors(X)
        labels = (scores > self.threshold).astype(int)
        return scores, labels

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------
    def save(self, directory: str) -> None:
        """Save model weights and threshold to <directory>/."""
        os.makedirs(directory, exist_ok=True)
        torch.save(self.model.state_dict(), os.path.join(directory, "autoencoder_weights.pt"))
        meta = {"input_dim": self.input_dim, "threshold": self.threshold}
        torch.save(meta, os.path.join(directory, "autoencoder_meta.pt"))

    @classmethod
    def load(cls, directory: str) -> "AnomalyDetector":
        """Reload a previously saved detector."""
        meta = torch.load(os.path.join(directory, "autoencoder_meta.pt"), map_location="cpu")
        detector = cls(input_dim=meta["input_dim"])
        detector.model.load_state_dict(
            torch.load(os.path.join(directory, "autoencoder_weights.pt"), map_location="cpu")
        )
        detector.threshold = meta["threshold"]
        return detector

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _reconstruction_errors(self, X: np.ndarray) -> np.ndarray:
        """Per-sample MSE between input and reconstruction."""
        self.model.eval()
        with torch.no_grad():
            tensor_X = torch.tensor(X, dtype=torch.float32, device=self.device)
            recon = self.model(tensor_X)
            # MSE per sample (mean over feature dim)
            errors = torch.mean((tensor_X - recon) ** 2, dim=1)
        return errors.cpu().numpy()
