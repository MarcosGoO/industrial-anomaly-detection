"""
End-to-end Sprint 1 training pipeline.

Pipeline stages
---------------
1. Load bearing CSVs from data/raw/
2. Window each channel → feature extraction → (n_windows, 30) per bearing
3. Split into train (normal) / test (normal + anomalous)
4. Fit StandardNormalizer on train only
5. Train Autoencoder on normalised train data
6. Compute 95th-percentile threshold on a validation subset
7. Evaluate on test set (Precision, Recall, F1, FPR)
8. Save model artifacts + evaluation report

Usage
-----
    python train_models.py
    python train_models.py --data-dir ../../data/raw --output-dir ../../data/models
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Resolve imports: allow running from ml_pipeline/scripts/ directly
# ---------------------------------------------------------------------------
BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent / "backend"
sys.path.insert(0, str(BACKEND_ROOT))

from app.preprocessing.signal_processing import window_signal
from app.preprocessing.feature_extraction import FeatureExtractor, FEATURE_NAMES, NUM_FEATURES
from app.preprocessing.normalization import StandardNormalizer
from app.models.autoencoder import AnomalyDetector


# ---------------------------------------------------------------------------
# Data loading & labelling
# ---------------------------------------------------------------------------
def load_bearing_data(data_dir: str) -> pd.DataFrame:
    """Read all bearing_*.csv files and concatenate with a source column."""
    data_dir = Path(data_dir)
    csvs = sorted(data_dir.glob("bearing_*.csv"))
    if not csvs:
        raise FileNotFoundError(
            f"No bearing_*.csv files found in {data_dir}. "
            "Run download_data.py --mode synthetic first."
        )
    frames = []
    for p in csvs:
        df = pd.read_csv(p)
        df["source_file"] = p.name
        frames.append(df)
        print(f"  Loaded {p.name}: {len(df):,} rows")
    return pd.concat(frames, ignore_index=True)


def extract_features_from_df(
    df: pd.DataFrame,
    signal_col: str = "ch1",
    phase_col: str = "phase",
) -> tuple[np.ndarray, np.ndarray]:
    """Window + extract features for each bearing source file.

    Returns
    -------
    features : (n_total_windows, 30)
    labels   : (n_total_windows,)  — 1 where phase == 'anomaly', else 0
    """
    extractor = FeatureExtractor()
    all_features = []
    all_labels = []

    for source in df["source_file"].unique():
        sub = df[df["source_file"] == source].reset_index(drop=True)
        signal = sub[signal_col].values.astype(np.float64)
        phases = sub[phase_col].values

        windows = window_signal(signal)                      # (n_windows, 1024)
        if len(windows) == 0:
            continue

        features = extractor.extract(windows)                # (n_windows, 30)

        # Map phases to window-level labels: a window is anomalous if ANY
        # of its samples fall in the anomaly phase.
        # Approximate: assign each window the phase of its first sample.
        from app.preprocessing.signal_processing import DEFAULT_WINDOW_SIZE, DEFAULT_HOP_SIZE
        n_windows = len(windows)
        window_starts = np.arange(n_windows) * DEFAULT_HOP_SIZE
        window_phases = phases[window_starts]
        labels = (window_phases == "anomaly").astype(int)

        all_features.append(features)
        all_labels.append(labels)
        print(f"    {source}: {n_windows} windows, {labels.sum()} anomalous")

    return np.vstack(all_features), np.concatenate(all_labels)


# ---------------------------------------------------------------------------
# Evaluation metrics
# ---------------------------------------------------------------------------
def evaluate(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    """Compute Precision, Recall, F1, FPR from binary arrays."""
    tp = int(((y_pred == 1) & (y_true == 1)).sum())
    fp = int(((y_pred == 1) & (y_true == 0)).sum())
    fn = int(((y_pred == 0) & (y_true == 1)).sum())
    tn = int(((y_pred == 0) & (y_true == 0)).sum())

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall    = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1        = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
    fpr       = fp / (fp + tn) if (fp + tn) > 0 else 0.0

    return {
        "precision": round(precision, 4),
        "recall":    round(recall, 4),
        "f1_score":  round(f1, 4),
        "fpr":       round(fpr, 4),
        "tp": tp, "fp": fp, "fn": fn, "tn": tn,
    }


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Train baseline Autoencoder detector.")
    parser.add_argument(
        "--data-dir",
        default=os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw"),
        help="Directory containing bearing_*.csv files",
    )
    parser.add_argument(
        "--output-dir",
        default=os.path.join(os.path.dirname(__file__), "..", "..", "data", "models"),
        help="Directory to save model artifacts and report",
    )
    parser.add_argument("--epochs",     type=int,   default=100)
    parser.add_argument("--lr",         type=float, default=1e-3)
    parser.add_argument("--batch-size", type=int,   default=256)
    parser.add_argument("--val-ratio",  type=float, default=0.1,
                        help="Fraction of normal training data used for threshold tuning")
    parser.add_argument("--test-ratio", type=float, default=0.2,
                        help="Fraction of ALL windowed data held out for evaluation")
    args = parser.parse_args()

    data_dir   = os.path.abspath(args.data_dir)
    output_dir = os.path.abspath(args.output_dir)
    os.makedirs(output_dir, exist_ok=True)

    start_time = time.time()

    # ------------------------------------------------------------------
    # 1. Load & extract
    # ------------------------------------------------------------------
    print("\n[1/5] Loading data …")
    df = load_bearing_data(data_dir)

    print("\n[2/5] Extracting features …")
    X_all, y_all = extract_features_from_df(df)
    print(f"    Total: {X_all.shape[0]} windows, {NUM_FEATURES} features, "
          f"{y_all.sum()} anomalous")

    # ------------------------------------------------------------------
    # 2. Train / test split  (stratified-ish: keep ratio of anomalies)
    # ------------------------------------------------------------------
    print("\n[3/5] Splitting data …")
    rng = np.random.default_rng(42)
    indices = np.arange(len(X_all))
    rng.shuffle(indices)
    split = int(len(indices) * (1 - args.test_ratio))

    train_idx, test_idx = indices[:split], indices[split:]
    X_train_all, y_train_all = X_all[train_idx], y_all[train_idx]
    X_test,      y_test      = X_all[test_idx],  y_all[test_idx]

    # Training set: only normal samples
    normal_mask = y_train_all == 0
    X_train_normal = X_train_all[normal_mask]

    # Validation subset (for threshold): last val_ratio of normal train data
    n_val = max(1, int(len(X_train_normal) * args.val_ratio))
    X_train, X_val = X_train_normal[:-n_val], X_train_normal[-n_val:]

    print(f"    Train (normal): {len(X_train)}")
    print(f"    Val   (normal): {len(X_val)}")
    print(f"    Test  (mixed):  {len(X_test)}  ({y_test.sum()} anomalous)")

    # ------------------------------------------------------------------
    # 3. Normalise
    # ------------------------------------------------------------------
    print("\n[4/5] Normalising …")
    normalizer = StandardNormalizer()
    X_train_n  = normalizer.fit_transform(X_train)
    X_val_n    = normalizer.transform(X_val)
    X_test_n   = normalizer.transform(X_test)
    normalizer.save(os.path.join(output_dir, "scaler.joblib"))

    # ------------------------------------------------------------------
    # 4. Train + threshold
    # ------------------------------------------------------------------
    print("\n[5/5] Training Autoencoder …")
    detector = AnomalyDetector(input_dim=NUM_FEATURES)
    detector.train_model(X_train_n, epochs=args.epochs, lr=args.lr,
                         batch_size=args.batch_size, verbose=True)
    threshold = detector.compute_threshold(X_val_n, percentile=95.0)
    print(f"    Threshold (95th percentile): {threshold:.6f}")

    # ------------------------------------------------------------------
    # 5. Evaluate on test set
    # ------------------------------------------------------------------
    scores, preds = detector.predict(X_test_n)
    metrics = evaluate(y_test, preds)

    print("\n" + "=" * 50)
    print("  EVALUATION RESULTS")
    print("=" * 50)
    for k, v in metrics.items():
        print(f"    {k:12s}: {v}")
    print("=" * 50)

    # ------------------------------------------------------------------
    # 6. Persist
    # ------------------------------------------------------------------
    detector.save(output_dir)

    report = {
        "timestamp":  time.strftime("%Y-%m-%d %H:%M:%S"),
        "duration_s": round(time.time() - start_time, 2),
        "hyperparams": {
            "epochs": args.epochs,
            "lr": args.lr,
            "batch_size": args.batch_size,
            "val_ratio": args.val_ratio,
            "test_ratio": args.test_ratio,
        },
        "data_stats": {
            "total_windows": int(len(X_all)),
            "total_anomalous": int(y_all.sum()),
            "train_normal": int(len(X_train)),
            "val_normal": int(len(X_val)),
            "test_total": int(len(X_test)),
            "test_anomalous": int(y_test.sum()),
        },
        "threshold": float(threshold),
        "metrics": metrics,
        "feature_names": FEATURE_NAMES,
    }

    report_path = os.path.join(output_dir, "evaluation_report.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"\n  Report saved: {report_path}")
    print(f"  Model saved:  {output_dir}/")


if __name__ == "__main__":
    main()
