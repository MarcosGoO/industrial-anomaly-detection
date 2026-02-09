/**
 * Prediction Service
 * Handles real-time prediction data fetching
 */

import { api } from './api';
import type { AnomalyPrediction } from '../types';

/**
 * Generate synthetic sensor data for demonstration
 */
export function generateSyntheticSensorData(anomalous: boolean = false): number[] {
  const dataPoints = 200;
  const samplingRate = 20; // Hz

  const baseSignal = Array.from({ length: dataPoints }, (_, i) => {
    const time = i / samplingRate;

    // Normal vibration pattern
    const mainFreq = Math.sin(2 * Math.PI * 30 * time) * 1.5;
    const harmonic1 = Math.sin(2 * Math.PI * 60 * time) * 0.4;
    const harmonic2 = Math.sin(2 * Math.PI * 90 * time) * 0.2;
    const noise = (Math.random() - 0.5) * 0.15;

    let signal = mainFreq + harmonic1 + harmonic2 + noise;

    // Add anomalous patterns
    if (anomalous) {
      // Add high-frequency spike at 120 Hz
      const spike = Math.sin(2 * Math.PI * 120 * time) * 1.2;
      // Add amplitude modulation
      const modulation = 1 + 0.5 * Math.sin(2 * Math.PI * 2 * time);
      signal = signal * modulation + spike;
    }

    return signal;
  });

  return baseSignal;
}

/**
 * Calculate FFT for spectrum analysis
 */
function calculateFFT(signal: number[], samplingRate: number = 20): { frequencies: number[], magnitudes: number[] } {
  const N = signal.length;
  const frequencies: number[] = [];
  const magnitudes: number[] = [];

  // Simple DFT implementation (for demo purposes)
  // In production, use a proper FFT library
  for (let k = 0; k < N / 2; k++) {
    const freq = (k * samplingRate) / N;
    frequencies.push(freq);

    let real = 0;
    let imag = 0;

    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      real += signal[n] * Math.cos(angle);
      imag -= signal[n] * Math.sin(angle);
    }

    const magnitude = Math.sqrt(real * real + imag * imag) / N;
    magnitudes.push(magnitude);
  }

  return { frequencies, magnitudes };
}

/**
 * Fetch prediction from the API
 */
export async function fetchPrediction(
  sensorData: number[]
): Promise<AnomalyPrediction> {
  try {
    const response = await api.post<AnomalyPrediction>('/api/predict', {
      sensor_data: sensorData,
    });
    return response;
  } catch (error) {
    console.error('Prediction API error:', error);
    // Return mock data if API fails
    return generateMockPrediction();
  }
}

/**
 * Generate mock prediction data for demonstration
 */
export function generateMockPrediction(): AnomalyPrediction {
  const isAnomalous = Math.random() > 0.8; // 20% chance of anomaly

  const autoencoderScore = isAnomalous
    ? 0.6 + Math.random() * 0.3
    : 0.1 + Math.random() * 0.2;

  const isolationScore = isAnomalous
    ? 0.5 + Math.random() * 0.4
    : 0.05 + Math.random() * 0.15;

  const lstmScore = isAnomalous
    ? 0.55 + Math.random() * 0.35
    : 0.08 + Math.random() * 0.18;

  const ensembleScore = (
    autoencoderScore * 0.4 +
    isolationScore * 0.3 +
    lstmScore * 0.3
  );

  // Generate waveform data
  const waveform = generateSyntheticSensorData(isAnomalous);

  // Calculate spectrum from waveform
  const spectrum = calculateFFT(waveform, 20);

  return {
    is_anomaly: ensembleScore > 0.5,
    ensemble_score: Number(ensembleScore.toFixed(4)),
    model_scores: {
      autoencoder: Number(autoencoderScore.toFixed(4)),
      isolation_forest: Number(isolationScore.toFixed(4)),
      lstm: Number(lstmScore.toFixed(4)),
    },
    features: {
      rms: 2.0 + Math.random() * 1.5,
      peak: 7.0 + Math.random() * 3.0,
      kurtosis: 3.0 + Math.random() * 1.5,
      skewness: 0.1 + Math.random() * 0.4,
      crest_factor: 3.0 + Math.random() * 1.0,
      energy: 40.0 + Math.random() * 15.0,
    },
    health_score: 1.0 - ensembleScore,
    temperature: 38.0 + Math.random() * 8.0,
    rul_hours: isAnomalous ? 24 + Math.random() * 72 : 100 + Math.random() * 100,
    timestamp: new Date().toISOString(),
    waveform,
    spectrum,
  };
}

/**
 * Simulate real-time data stream
 */
export function createDataStream(
  callback: (prediction: AnomalyPrediction) => void,
  intervalMs: number = 2000
): () => void {
  const interval = setInterval(async () => {
    const sensorData = generateSyntheticSensorData();
    const prediction = await fetchPrediction(sensorData);
    callback(prediction);
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(interval);
}

/**
 * Calculate feature statistics
 */
export function calculateFeatureStats(predictions: AnomalyPrediction[]) {
  if (predictions.length === 0) return null;

  const latest = predictions[0];
  const history = predictions.slice(1, Math.min(predictions.length, 100));

  const avgHealthScore = history.reduce((sum, p) => sum + (p.health_score ?? 0), 0) / history.length;
  const avgTemp = history.reduce((sum, p) => sum + (p.temperature ?? 0), 0) / history.length;
  const anomalyCount = history.filter(p => p.is_anomaly).length;

  return {
    latest,
    avgHealthScore: Number(avgHealthScore.toFixed(3)),
    avgTemperature: Number(avgTemp.toFixed(1)),
    anomalyCount,
    anomalyRate: Number((anomalyCount / history.length * 100).toFixed(1)),
  };
}
