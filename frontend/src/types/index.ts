/**
 * Type definitions for Industrial Anomaly Detection System
 */

export type AlertLevel = 'normal' | 'warning' | 'critical';

export interface AnomalyPrediction {
  sample_index?: number;
  ensemble_score: number;
  alert_level?: AlertLevel;
  is_anomaly: boolean;
  individual_scores?: {
    autoencoder?: number;
    isolation_forest?: number;
    lstm?: number;
  };
  // Extended fields for real-time monitoring
  model_scores?: {
    autoencoder: number;
    isolation_forest: number;
    lstm: number;
  };
  features?: {
    rms: number;
    peak: number;
    kurtosis: number;
    skewness: number;
    crest_factor: number;
    energy: number;
  };
  health_score?: number;
  temperature?: number;
  rul_hours?: number;
  timestamp?: string;
  // Visualization data
  waveform?: number[];
  spectrum?: {
    frequencies: number[];
    magnitudes: number[];
  };
}

export interface PredictionSummary {
  total_samples: number;
  anomalies_detected: number;
  normal_count: number;
  warning_count: number;
  critical_count: number;
  avg_ensemble_score: number;
}

export interface PredictionResponse {
  predictions: AnomalyPrediction[];
  summary: PredictionSummary;
}

export interface PredictionRequest {
  features: number[][];
}

export interface ModelMetrics {
  name: string;
  loaded: boolean;
  threshold: number | null;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  models: ModelMetrics[];
  ensemble_config: {
    weights: {
      autoencoder: number;
      isolation_forest: number;
      lstm: number;
    };
  };
}

export interface SensorData {
  timestamp: Date;
  vibration: number;
  temperature: number;
  features: number[];
}
