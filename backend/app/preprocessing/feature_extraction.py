"""
Feature extraction — the single source of truth for all 30 features.

Every downstream consumer (normalizer, autoencoder input_dim, tests,
notebooks) must reference FEATURE_NAMES defined at module level.

Feature groups
──────────────
  TimeDomainFeatures      →  10 features  (indices  0–9)
  FrequencyDomainFeatures →  10 features  (indices 10–19)
  WaveletDomainFeatures   →  10 features  (indices 20–29)
"""

from __future__ import annotations

import numpy as np
import pywt
from scipy.fft import fft, fftfreq

from .signal_processing import SAMPLE_RATE, apply_hanning_window

# ---------------------------------------------------------------------------
# Canonical feature name list — single source of truth
# ---------------------------------------------------------------------------
FEATURE_NAMES: list[str] = [
    # Time domain (0–9)
    "rms",
    "peak",
    "crest_factor",
    "kurtosis",
    "skewness",
    "std_dev",
    "energy",
    "mean_abs_value",
    "peak_to_peak",
    "impulse_factor",
    # Frequency domain (10–19)
    "dominant_freq",
    "spectral_centroid",
    "spectral_rolloff_85",
    "spectral_spread",
    "band_power_0_1k",
    "band_power_1_2k",
    "band_power_2_5k",
    "band_power_5_10k",
    "freq_variance",
    "spectral_kurtosis",
    # Wavelet domain (20–29)
    "wavelet_detail_energy_1",
    "wavelet_detail_energy_2",
    "wavelet_detail_energy_3",
    "wavelet_detail_energy_4",
    "wavelet_approx_energy_4",
    "wavelet_entropy_1",
    "wavelet_entropy_2",
    "wavelet_entropy_3",
    "wavelet_entropy_4",
    "wavelet_variance",
]

assert len(FEATURE_NAMES) == 30, "FEATURE_NAMES must contain exactly 30 entries"

NUM_FEATURES: int = len(FEATURE_NAMES)


# ---------------------------------------------------------------------------
# Time-domain features
# ---------------------------------------------------------------------------
class TimeDomainFeatures:
    """Compute 10 time-domain statistical features from a single window."""

    @staticmethod
    def compute(window: np.ndarray) -> np.ndarray:
        """Args: window — 1-D array (single window).  Returns: shape (10,)."""
        n = len(window)
        mean = window.mean()
        std = window.std(ddof=0)
        rms = np.sqrt(np.mean(window ** 2))
        peak = np.max(np.abs(window))
        crest_factor = peak / (rms + 1e-12)

        # Kurtosis & skewness (Fisher definitions)
        centered = window - mean
        m2 = np.mean(centered ** 2)
        m3 = np.mean(centered ** 3)
        m4 = np.mean(centered ** 4)
        kurtosis = m4 / (m2 ** 2 + 1e-12) - 3.0
        skewness = m3 / (m2 ** 1.5 + 1e-12)

        energy = np.sum(window ** 2)
        mav = np.mean(np.abs(window))
        peak_to_peak = np.ptp(window)
        impulse_factor = peak / (mav + 1e-12)

        return np.array([
            rms, peak, crest_factor, kurtosis, skewness,
            std, energy, mav, peak_to_peak, impulse_factor,
        ])


# ---------------------------------------------------------------------------
# Frequency-domain features (FFT)
# ---------------------------------------------------------------------------
class FrequencyDomainFeatures:
    """Compute 10 frequency-domain features from a single window.

    The window should already be Hanning-tapered before calling this class
    (see FeatureExtractor.extract).
    """

    # Band edges in Hz
    BANDS = [(0, 1000), (1000, 2000), (2000, 5000), (5000, 10000)]

    @staticmethod
    def compute(window: np.ndarray, sample_rate: int = SAMPLE_RATE) -> np.ndarray:
        """Args: window — 1-D tapered window.  Returns: shape (10,)."""
        n = len(window)
        spectrum = np.abs(fft(window))
        freqs = fftfreq(n, d=1.0 / sample_rate)

        # Use only positive frequencies
        pos = freqs > 0
        freqs_pos = freqs[pos]
        mag_pos = spectrum[pos]
        power = mag_pos ** 2

        total_power = power.sum() + 1e-12

        # Dominant frequency
        dominant_freq = freqs_pos[np.argmax(mag_pos)]

        # Spectral centroid
        spectral_centroid = np.sum(freqs_pos * power) / total_power

        # Spectral rolloff (frequency below which 85 % of power lies)
        cum_power = np.cumsum(power)
        rolloff_idx = np.searchsorted(cum_power, 0.85 * cum_power[-1])
        spectral_rolloff = freqs_pos[min(rolloff_idx, len(freqs_pos) - 1)]

        # Spectral spread (std of power distribution)
        spectral_spread = np.sqrt(
            np.sum(power * (freqs_pos - spectral_centroid) ** 2) / total_power
        )

        # Band powers
        band_powers = []
        for lo, hi in FrequencyDomainFeatures.BANDS:
            mask = (freqs_pos >= lo) & (freqs_pos < hi)
            band_powers.append(power[mask].sum())

        # Frequency variance
        freq_variance = np.sum(power * (freqs_pos - spectral_centroid) ** 2) / total_power

        # Spectral kurtosis
        if spectral_spread > 1e-12:
            spectral_kurtosis = (
                np.sum(power * ((freqs_pos - spectral_centroid) / spectral_spread) ** 4)
                / total_power
            ) - 3.0
        else:
            spectral_kurtosis = 0.0

        return np.array([
            dominant_freq, spectral_centroid, spectral_rolloff, spectral_spread,
            *band_powers,
            freq_variance, spectral_kurtosis,
        ])


# ---------------------------------------------------------------------------
# Wavelet-domain features
# ---------------------------------------------------------------------------
class WaveletDomainFeatures:
    """Compute 10 wavelet-domain features using a 4-level db4 decomposition."""

    WAVELET = "db4"
    LEVEL = 4

    @staticmethod
    def compute(window: np.ndarray) -> np.ndarray:
        """Args: window — 1-D raw (un-tapered) window.  Returns: shape (10,)."""
        coeffs = pywt.wavedec(window, WaveletDomainFeatures.WAVELET,
                              level=WaveletDomainFeatures.LEVEL)
        # coeffs = [cA4, cD4, cD3, cD2, cD1]  (approximation first, then details high→low)
        approx = coeffs[0]
        details = coeffs[1:]  # [cD4, cD3, cD2, cD1]

        # Energies
        detail_energies = [np.sum(d ** 2) for d in details]  # D4, D3, D2, D1
        approx_energy = np.sum(approx ** 2)

        # Reorder to D1, D2, D3, D4 (low-to-high detail level)
        detail_energies_ordered = list(reversed(detail_energies))  # [D1, D2, D3, D4]

        # Entropies (Shannon-style on normalised squared coefficients)
        entropies = []
        for d in reversed(details):  # D1, D2, D3, D4 order
            p = d ** 2
            p_sum = p.sum() + 1e-12
            p_norm = p / p_sum
            p_norm = p_norm[p_norm > 0]
            entropies.append(-np.sum(p_norm * np.log2(p_norm)))

        # Wavelet variance — variance across all detail coefficients concatenated
        all_details = np.concatenate(details)
        wavelet_variance = np.var(all_details)

        return np.array([
            *detail_energies_ordered,   # D1, D2, D3, D4
            approx_energy,
            *entropies,                 # entropy D1, D2, D3, D4
            wavelet_variance,
        ])


# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------
class FeatureExtractor:
    """Extract all 30 features from a 2-D array of windows.

    Typical usage
    -------------
        from signal_processing import window_signal
        windows = window_signal(raw_signal)           # (n_windows, 1024)
        extractor = FeatureExtractor()
        features = extractor.extract(windows)         # (n_windows, 30)
    """

    def __init__(self, sample_rate: int = SAMPLE_RATE):
        self.sample_rate = sample_rate

    def extract(self, windows: np.ndarray) -> np.ndarray:
        """Compute features for every window.

        Args:
            windows: shape (n_windows, window_size).

        Returns:
            shape (n_windows, 30) — columns match FEATURE_NAMES ordering.
        """
        if windows.ndim != 2:
            raise ValueError(f"Expected 2-D windows array, got ndim={windows.ndim}")
        if len(windows) == 0:
            return np.empty((0, NUM_FEATURES))

        # Hanning-tapered copy for FFT features only
        tapered = apply_hanning_window(windows)

        rows = []
        for i in range(len(windows)):
            raw_win = windows[i]
            tap_win = tapered[i]

            td = TimeDomainFeatures.compute(raw_win)
            fd = FrequencyDomainFeatures.compute(tap_win, self.sample_rate)
            wd = WaveletDomainFeatures.compute(raw_win)

            rows.append(np.concatenate([td, fd, wd]))

        result = np.array(rows)
        assert result.shape[1] == NUM_FEATURES, (
            f"Feature count mismatch: got {result.shape[1]}, expected {NUM_FEATURES}"
        )
        return result
