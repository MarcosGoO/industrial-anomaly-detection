"""
Data acquisition for the Industrial Anomaly Detection System.

Modes:
    synthetic  — Generate realistic bearing vibration data locally (default, no network)
    nasa       — Attempt to download the NASA IMS Bearing Dataset
    both       — Try NASA first, fall back to synthetic

Usage:
    python download_data.py --mode synthetic --output-dir ../../data/raw
"""

import argparse
import os
import sys
import time
from pathlib import Path

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
SAMPLE_RATE = 20000  # Hz — matches NASA IMS dataset
DURATION_NORMAL = 60.0  # seconds of normal operation per bearing
DURATION_DEGRADED = 30.0  # seconds of degradation phase
DURATION_ANOMALY = 10.0  # seconds containing injected anomalies

BASE_RPM = 2400  # rotational speed (rev/min)
BASE_FREQ = BASE_RPM / 60  # rotational frequency in Hz (40 Hz)


# ---------------------------------------------------------------------------
# Synthetic Data Generator
# ---------------------------------------------------------------------------
class SyntheticDataGenerator:
    """Generates realistic multi-channel bearing vibration and temperature data.

    Signal model per channel:
        normal     = rotational_freq + harmonics + broadband noise
        degraded   = normal + ramp(noise_amplitude) over time
        anomalous  = degraded + injected fault events (spikes / freq shifts)

    Temperature is correlated with the vibration envelope (RMS over short windows).
    """

    def __init__(self, seed: int = 42):
        self.rng = np.random.default_rng(seed)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def generate_bearing(
        self,
        bearing_id: int,
        n_channels: int = 4,
        include_anomalies: bool = True,
    ) -> pd.DataFrame:
        """Return a DataFrame with columns: timestamp, ch1, ch2, ch3, ch4, temperature."""
        n_normal = int(DURATION_NORMAL * SAMPLE_RATE)
        n_degraded = int(DURATION_DEGRADED * SAMPLE_RATE)
        n_anomaly = int(DURATION_ANOMALY * SAMPLE_RATE) if include_anomalies else 0
        total = n_normal + n_degraded + n_anomaly

        t = np.arange(total) / SAMPLE_RATE  # seconds

        channels = []
        for ch in range(n_channels):
            # Each channel has a slightly different base frequency offset
            freq_offset = ch * 2.5  # Hz offset per channel
            signal = self._generate_signal(t, n_normal, n_degraded, freq_offset)
            if include_anomalies and n_anomaly > 0:
                signal = self._inject_anomalies(signal, n_normal + n_degraded)
            channels.append(signal)

        channels = np.column_stack(channels)
        temperature = self._generate_temperature(channels, t)
        timestamps = (pd.Timestamp("2024-01-01") + pd.to_timedelta(t, unit="s"))

        df = pd.DataFrame(channels, columns=[f"ch{i+1}" for i in range(n_channels)])
        df.insert(0, "timestamp", timestamps)
        df["temperature"] = temperature
        df["bearing_id"] = bearing_id
        df["phase"] = "normal"
        df.loc[n_normal:n_normal + n_degraded, "phase"] = "degraded"
        if n_anomaly > 0:
            df.loc[n_normal + n_degraded:, "phase"] = "anomaly"

        return df

    def generate_dataset(self, n_bearings: int = 4, output_dir: str = ".") -> list[str]:
        """Generate one CSV per bearing. Returns list of created file paths."""
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        paths = []
        for i in range(n_bearings):
            df = self.generate_bearing(bearing_id=i + 1, include_anomalies=(i >= 2))
            path = os.path.join(output_dir, f"bearing_{i+1}.csv")
            df.to_csv(path, index=False)
            paths.append(path)
            print(f"  [synthetic] bearing_{i+1}.csv  ({len(df):,} samples, "
                  f"anomalies={'yes' if i >= 2 else 'no'})")
        return paths

    # ------------------------------------------------------------------
    # Signal generation internals
    # ------------------------------------------------------------------
    def _generate_signal(
        self, t: np.ndarray, n_normal: int, n_degraded: int, freq_offset: float
    ) -> np.ndarray:
        """Build normal + degraded signal from rotational harmonics + noise."""
        freq = BASE_FREQ + freq_offset
        signal = np.zeros_like(t)

        # Rotational frequency + first 4 harmonics (amplitudes decay)
        for h in range(1, 5):
            amp = 1.0 / h
            phase = self.rng.uniform(0, 2 * np.pi)
            signal += amp * np.sin(2 * np.pi * freq * h * t + phase)

        # Bearing characteristic frequencies (simplified BPFO/BPFI model)
        bpfo = freq * 3.2   # ball-pass frequency outer race
        bpfi = freq * 5.1   # ball-pass frequency inner race
        for cf in (bpfo, bpfi):
            amp = 0.15 * (1 + 0.3 * self.rng.standard_normal())
            signal += amp * np.sin(2 * np.pi * cf * t + self.rng.uniform(0, 2 * np.pi))

        # Broadband noise — constant in normal phase
        noise_base = 0.05
        noise = noise_base * self.rng.standard_normal(len(t))

        # Degradation: noise amplitude ramps up linearly in degraded phase
        ramp = np.ones(len(t))
        if n_degraded > 0:
            start = n_normal
            end = n_normal + n_degraded
            ramp[start:end] = np.linspace(1.0, 4.0, n_degraded)
            ramp[end:] = 4.0  # stays elevated into anomaly phase

        signal += noise * ramp
        return signal

    def _inject_anomalies(self, signal: np.ndarray, anomaly_start: int) -> np.ndarray:
        """Inject three types of fault events into the anomaly segment."""
        seg = signal[anomaly_start:].copy()
        seg_len = len(seg)
        if seg_len == 0:
            return signal

        n_events = 8
        for _ in range(n_events):
            event_type = self.rng.choice(["spike", "freq_shift", "amplitude_burst"])
            pos = self.rng.integers(0, seg_len - 200)

            if event_type == "spike":
                # Impulse burst (bearing impact signature)
                width = self.rng.integers(20, 80)
                envelope = np.exp(-np.arange(width) / 15.0)
                carrier = np.sin(2 * np.pi * 3000 * np.arange(width) / SAMPLE_RATE)
                seg[pos:pos + width] += 5.0 * envelope * carrier

            elif event_type == "freq_shift":
                # Sudden frequency change (misalignment symptom)
                width = self.rng.integers(100, 400)
                new_freq = self.rng.uniform(500, 8000)
                t_local = np.arange(width) / SAMPLE_RATE
                seg[pos:pos + width] += 2.0 * np.sin(2 * np.pi * new_freq * t_local)

            elif event_type == "amplitude_burst":
                # Broad amplitude surge (looseness symptom)
                width = self.rng.integers(150, 500)
                burst = 3.0 * self.rng.standard_normal(width)
                seg[pos:pos + width] += burst

        signal[anomaly_start:] = seg
        return signal

    def _generate_temperature(self, vibration: np.ndarray, t: np.ndarray) -> np.ndarray:
        """Temperature correlated with vibration RMS envelope + slow drift."""
        # Compute RMS in sliding windows
        window = 2000
        rms = np.sqrt(
            np.convolve(vibration[:, 0] ** 2, np.ones(window) / window, mode="same")
        )
        # Scale to realistic temperature range (25–95 °C)
        rms_norm = (rms - rms.min()) / (rms.max() - rms.min() + 1e-8)
        temp = 35.0 + 40.0 * rms_norm
        # Add slow thermal drift
        drift = 5.0 * np.sin(2 * np.pi * t / 300)  # 5-min thermal cycle
        temp += drift + 0.5 * self.rng.standard_normal(len(t))
        return np.clip(temp, 20.0, 100.0)


# ---------------------------------------------------------------------------
# NASA Dataset Downloader (best-effort; requires network)
# ---------------------------------------------------------------------------
class NASADataDownloader:
    """Attempts to download the NASA IMS Bearing Dataset.

    The dataset is hosted on NASA's open-data portal. If the download fails
    for any reason the caller should fall back to SyntheticDataGenerator.
    """

    # Known mirror / direct URLs (may change over time)
    URLS = [
        "https://data.nasa.gov/api/views/4jt9-j2vi/rows.csv?accessType=DOWNLOAD",
    ]

    def __init__(self, output_dir: str = "."):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def download(self) -> bool:
        """Try each URL. Returns True if any succeeded."""
        try:
            import urllib.request
        except ImportError:
            print("  [nasa] urllib not available — skipping.")
            return False

        for url in self.URLS:
            try:
                print(f"  [nasa] Trying {url} …")
                dest = self.output_dir / "nasa_bearing_raw.csv"
                urllib.request.urlretrieve(url, str(dest))
                print(f"  [nasa] Downloaded to {dest}")
                return True
            except Exception as exc:
                print(f"  [nasa] Failed: {exc}")
        return False


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Acquire bearing data for anomaly detection.")
    parser.add_argument(
        "--mode",
        choices=["synthetic", "nasa", "both"],
        default="synthetic",
        help="Data source mode (default: synthetic)",
    )
    parser.add_argument(
        "--output-dir",
        default=os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw"),
        help="Directory to write CSV files",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for synthetic generation",
    )
    args = parser.parse_args()

    output_dir = os.path.abspath(args.output_dir)
    print(f"Output directory: {output_dir}\n")

    if args.mode in ("nasa", "both"):
        print("[1/2] Attempting NASA download …")
        nasa_ok = NASADataDownloader(output_dir).download()
        if not nasa_ok and args.mode == "nasa":
            print("\n  NASA download failed and mode=nasa. Exiting.")
            sys.exit(1)
        print()

    if args.mode in ("synthetic", "both"):
        print("[2/2] Generating synthetic data …" if args.mode == "both" else "[1/1] Generating synthetic data …")
        gen = SyntheticDataGenerator(seed=args.seed)
        paths = gen.generate_dataset(n_bearings=4, output_dir=output_dir)
        print(f"\n  {len(paths)} files written to {output_dir}")


if __name__ == "__main__":
    main()
