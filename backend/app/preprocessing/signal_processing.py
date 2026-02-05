"""
Low-level signal processing primitives: windowing, validation, constants.

All modules in this package consume raw 1-D vibration arrays produced by
download_data.py.  This module is the single entry point that sits between
raw CSV columns and feature extraction.
"""

import numpy as np

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
SAMPLE_RATE: int = 20_000       # Hz — NASA IMS dataset sampling rate
DEFAULT_WINDOW_SIZE: int = 1024  # samples (~51 ms @ 20 kHz)
DEFAULT_HOP_SIZE: int = 512     # 50 % overlap


# ---------------------------------------------------------------------------
# Windowing
# ---------------------------------------------------------------------------
def window_signal(
    signal: np.ndarray,
    window_size: int = DEFAULT_WINDOW_SIZE,
    hop_size: int = DEFAULT_HOP_SIZE,
) -> np.ndarray:
    """Split a 1-D signal into overlapping fixed-length windows.

    Args:
        signal:      1-D array of raw vibration samples.
        window_size: Number of samples per window.
        hop_size:    Number of samples between successive window starts.

    Returns:
        2-D array of shape (n_windows, window_size).  Returns an empty
        array with shape (0, window_size) when the signal is too short.

    Raises:
        ValueError: If window_size or hop_size is < 1, or signal is not 1-D.
    """
    signal = _validate_signal(signal)
    if window_size < 1 or hop_size < 1:
        raise ValueError("window_size and hop_size must be >= 1")

    n_windows = max(0, (len(signal) - window_size) // hop_size + 1)
    if n_windows == 0:
        return np.empty((0, window_size), dtype=signal.dtype)

    # Stride trick — zero-copy view into the original array
    shape = (n_windows, window_size)
    strides = (signal.strides[0] * hop_size, signal.strides[0])
    return np.lib.stride_tricks.as_strided(signal, shape=shape, strides=strides).copy()


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------
def _validate_signal(signal: np.ndarray) -> np.ndarray:
    """Coerce input to a clean 1-D float64 array; raise on bad data."""
    signal = np.asarray(signal, dtype=np.float64)
    if signal.ndim != 1:
        raise ValueError(f"Expected 1-D signal, got shape {signal.shape}")
    if len(signal) == 0:
        raise ValueError("Signal must not be empty")

    # Replace NaNs / Infs with zeros — silent but safe for downstream math
    bad = ~np.isfinite(signal)
    if bad.any():
        signal = signal.copy()
        signal[bad] = 0.0
    return signal


def apply_hanning_window(windows: np.ndarray) -> np.ndarray:
    """Multiply each row by a Hanning window (reduces spectral leakage in FFT)."""
    if windows.ndim != 2:
        raise ValueError("Expected 2-D array of windows")
    hann = np.hanning(windows.shape[1])
    return windows * hann
