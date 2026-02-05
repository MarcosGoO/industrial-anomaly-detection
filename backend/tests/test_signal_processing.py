"""Unit tests for signal_processing.py — windowing, validation, Hanning."""

import numpy as np
import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.preprocessing.signal_processing import (
    window_signal,
    apply_hanning_window,
    SAMPLE_RATE,
    DEFAULT_WINDOW_SIZE,
    DEFAULT_HOP_SIZE,
)


class TestWindowSignal:
    """Tests for window_signal()."""

    def test_basic_shape(self):
        """Output shape is correct for a clean signal."""
        signal = np.ones(4096)
        windows = window_signal(signal)
        expected_n = (len(signal) - DEFAULT_WINDOW_SIZE) // DEFAULT_HOP_SIZE + 1
        assert windows.shape == (expected_n, DEFAULT_WINDOW_SIZE)

    def test_custom_window_and_hop(self):
        signal = np.zeros(2000)
        windows = window_signal(signal, window_size=500, hop_size=250)
        expected_n = (2000 - 500) // 250 + 1  # 7
        assert windows.shape == (expected_n, 500)

    def test_signal_too_short_returns_empty(self):
        """Signal shorter than one window → (0, window_size)."""
        signal = np.ones(100)
        windows = window_signal(signal, window_size=1024)
        assert windows.shape == (0, 1024)

    def test_signal_exactly_one_window(self):
        signal = np.arange(1024, dtype=float)
        windows = window_signal(signal, window_size=1024, hop_size=512)
        assert windows.shape == (1, 1024)
        np.testing.assert_array_equal(windows[0], signal)

    def test_nan_replaced_with_zero(self):
        """NaN/Inf values are silently replaced with 0."""
        signal = np.ones(2048)
        signal[100] = np.nan
        signal[200] = np.inf
        signal[300] = -np.inf
        windows = window_signal(signal)
        assert np.all(np.isfinite(windows))

    def test_raises_on_empty(self):
        with pytest.raises(ValueError, match="must not be empty"):
            window_signal(np.array([]))

    def test_raises_on_2d(self):
        with pytest.raises(ValueError, match="1-D"):
            window_signal(np.ones((10, 3)))

    def test_raises_on_bad_params(self):
        with pytest.raises(ValueError):
            window_signal(np.ones(2048), window_size=0)
        with pytest.raises(ValueError):
            window_signal(np.ones(2048), hop_size=-1)

    def test_windows_are_independent_copies(self):
        """Modifying one window must not affect the original or others."""
        signal = np.arange(4096, dtype=float)
        windows = window_signal(signal)
        original_val = windows[1, 0]
        windows[0, 0] = -9999.0
        assert windows[1, 0] == original_val


class TestApplyHanning:
    def test_shape_preserved(self):
        w = np.ones((5, 1024))
        tapered = apply_hanning_window(w)
        assert tapered.shape == (5, 1024)

    def test_edges_are_zero(self):
        """Hanning window is ~0 at boundaries."""
        w = np.ones((1, 64))
        tapered = apply_hanning_window(w)
        assert tapered[0, 0] < 1e-10
        assert tapered[0, -1] < 1e-10

    def test_raises_on_1d(self):
        with pytest.raises(ValueError):
            apply_hanning_window(np.ones(100))


class TestConstants:
    def test_sample_rate(self):
        assert SAMPLE_RATE == 20_000

    def test_defaults_positive(self):
        assert DEFAULT_WINDOW_SIZE > 0
        assert DEFAULT_HOP_SIZE > 0
        assert DEFAULT_HOP_SIZE <= DEFAULT_WINDOW_SIZE
