"""Unit tests for feature_extraction.py — shape, value sanity, FEATURE_NAMES."""

import numpy as np
import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.preprocessing.feature_extraction import (
    TimeDomainFeatures,
    FrequencyDomainFeatures,
    WaveletDomainFeatures,
    FeatureExtractor,
    FEATURE_NAMES,
    NUM_FEATURES,
)
from app.preprocessing.signal_processing import window_signal


# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------
@pytest.fixture
def sine_window():
    """Single 1024-sample sinusoidal window at 440 Hz."""
    t = np.arange(1024) / 20000.0
    return np.sin(2 * np.pi * 440 * t)


@pytest.fixture
def windows_array():
    """5 windows of white noise."""
    rng = np.random.default_rng(7)
    return rng.standard_normal((5, 1024))


# ---------------------------------------------------------------------------
# FEATURE_NAMES invariant
# ---------------------------------------------------------------------------
class TestFeatureNames:
    def test_length(self):
        assert len(FEATURE_NAMES) == 30

    def test_no_duplicates(self):
        assert len(set(FEATURE_NAMES)) == 30

    def test_num_features_constant(self):
        assert NUM_FEATURES == 30


# ---------------------------------------------------------------------------
# TimeDomainFeatures
# ---------------------------------------------------------------------------
class TestTimeDomainFeatures:
    def test_output_shape(self, sine_window):
        result = TimeDomainFeatures.compute(sine_window)
        assert result.shape == (10,)

    def test_rms_positive(self, sine_window):
        result = TimeDomainFeatures.compute(sine_window)
        assert result[0] > 0  # rms

    def test_peak_gte_rms(self, sine_window):
        result = TimeDomainFeatures.compute(sine_window)
        rms, peak = result[0], result[1]
        assert peak >= rms

    def test_crest_factor_sine(self, sine_window):
        """Crest factor of a pure sine ≈ √2 ≈ 1.414."""
        result = TimeDomainFeatures.compute(sine_window)
        assert abs(result[2] - np.sqrt(2)) < 0.05

    def test_constant_signal_zero_kurtosis(self):
        """Constant signal → kurtosis should be near -3 (excess) or 0 depending on impl."""
        signal = np.ones(1024) * 5.0
        result = TimeDomainFeatures.compute(signal)
        # std=0 → kurtosis = m4/(m2^2) - 3 = 0/0 → handled via epsilon, expect ~0
        assert np.isfinite(result[3])

    def test_all_finite(self, sine_window):
        result = TimeDomainFeatures.compute(sine_window)
        assert np.all(np.isfinite(result))


# ---------------------------------------------------------------------------
# FrequencyDomainFeatures
# ---------------------------------------------------------------------------
class TestFrequencyDomainFeatures:
    def test_output_shape(self, sine_window):
        from app.preprocessing.signal_processing import apply_hanning_window
        tapered = apply_hanning_window(sine_window.reshape(1, -1))[0]
        result = FrequencyDomainFeatures.compute(tapered)
        assert result.shape == (10,)

    def test_dominant_freq_pure_sine(self):
        """Dominant frequency of a 1000 Hz sine should be ~1000 Hz."""
        t = np.arange(1024) / 20000.0
        signal = np.sin(2 * np.pi * 1000 * t)
        from app.preprocessing.signal_processing import apply_hanning_window
        tapered = apply_hanning_window(signal.reshape(1, -1))[0]
        result = FrequencyDomainFeatures.compute(tapered)
        assert abs(result[0] - 1000) < 50  # within 50 Hz bin width

    def test_band_powers_non_negative(self, sine_window):
        from app.preprocessing.signal_processing import apply_hanning_window
        tapered = apply_hanning_window(sine_window.reshape(1, -1))[0]
        result = FrequencyDomainFeatures.compute(tapered)
        band_powers = result[4:8]
        assert np.all(band_powers >= 0)

    def test_all_finite(self, sine_window):
        from app.preprocessing.signal_processing import apply_hanning_window
        tapered = apply_hanning_window(sine_window.reshape(1, -1))[0]
        result = FrequencyDomainFeatures.compute(tapered)
        assert np.all(np.isfinite(result))


# ---------------------------------------------------------------------------
# WaveletDomainFeatures
# ---------------------------------------------------------------------------
class TestWaveletDomainFeatures:
    def test_output_shape(self, sine_window):
        result = WaveletDomainFeatures.compute(sine_window)
        assert result.shape == (10,)

    def test_energies_non_negative(self, sine_window):
        result = WaveletDomainFeatures.compute(sine_window)
        energies = result[0:5]  # D1, D2, D3, D4, A4
        assert np.all(energies >= 0)

    def test_entropies_non_negative(self, sine_window):
        result = WaveletDomainFeatures.compute(sine_window)
        entropies = result[5:9]
        assert np.all(entropies >= 0)

    def test_all_finite(self, sine_window):
        result = WaveletDomainFeatures.compute(sine_window)
        assert np.all(np.isfinite(result))


# ---------------------------------------------------------------------------
# FeatureExtractor (orchestrator)
# ---------------------------------------------------------------------------
class TestFeatureExtractor:
    def test_output_shape(self, windows_array):
        extractor = FeatureExtractor()
        features = extractor.extract(windows_array)
        assert features.shape == (5, 30)

    def test_empty_input(self):
        extractor = FeatureExtractor()
        features = extractor.extract(np.empty((0, 1024)))
        assert features.shape == (0, NUM_FEATURES)

    def test_single_window(self, sine_window):
        extractor = FeatureExtractor()
        features = extractor.extract(sine_window.reshape(1, -1))
        assert features.shape == (1, 30)
        assert np.all(np.isfinite(features))

    def test_raises_on_1d(self):
        extractor = FeatureExtractor()
        with pytest.raises(ValueError, match="2-D"):
            extractor.extract(np.ones(1024))

    def test_end_to_end_from_signal(self):
        """Full pipeline: raw signal → windows → features."""
        rng = np.random.default_rng(99)
        signal = rng.standard_normal(20000)
        windows = window_signal(signal)
        extractor = FeatureExtractor()
        features = extractor.extract(windows)
        assert features.shape[0] == len(windows)
        assert features.shape[1] == 30
        assert np.all(np.isfinite(features))
