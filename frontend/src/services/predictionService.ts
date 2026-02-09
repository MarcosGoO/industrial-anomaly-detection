/**
 * Prediction Service
 * Handles real-time prediction data fetching
 */

import { api } from './api';
import type { AnomalyPrediction } from '../types';

/**
 * Generate synthetic sensor data for demonstration
 */
export function generateSyntheticSensorData(): number[] {
  const dataPoints = 100;
  const baseSignal = Array.from({ length: dataPoints }, (_, i) => {
    // Combine multiple sine waves to simulate vibration
    const time = i / dataPoints;
    const mainFreq = Math.sin(2 * Math.PI * 10 * time) * 2;
    const harmonic1 = Math.sin(2 * Math.PI * 20 * time) * 0.5;
    const harmonic2 = Math.sin(2 * Math.PI * 30 * time) * 0.3;
    const noise = (Math.random() - 0.5) * 0.2;

    return mainFreq + harmonic1 + harmonic2 + noise;
  });

  return baseSignal;
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

  const avgHealthScore = history.reduce((sum, p) => sum + p.health_score, 0) / history.length;
  const avgTemp = history.reduce((sum, p) => sum + p.temperature, 0) / history.length;
  const anomalyCount = history.filter(p => p.is_anomaly).length;

  return {
    latest,
    avgHealthScore: Number(avgHealthScore.toFixed(3)),
    avgTemperature: Number(avgTemp.toFixed(1)),
    anomalyCount,
    anomalyRate: Number((anomalyCount / history.length * 100).toFixed(1)),
  };
}
