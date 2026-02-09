/**
 * Real-Time Monitoring Dashboard
 * Live vibration monitoring, spectrum, and health status
 */

import {
  Activity,
  Gauge,
  Thermometer,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { usePredictions } from '../../hooks/usePredictions';
import { WaveformChart, SpectrumChart } from '../Visualizations';

export function RealTimeMonitor() {
  const { currentPrediction } = usePredictions({ autoStart: true, intervalMs: 3000 });

  // Default values if no prediction yet
  const healthScore = currentPrediction?.health_score ?? 0.95;
  const anomalyScore = currentPrediction?.ensemble_score ?? 0.12;
  const temperature = currentPrediction?.temperature ?? 42;
  const rulHours = currentPrediction?.rul_hours ?? 156;
  const features = currentPrediction?.features ?? {
    rms: 2.34,
    peak: 8.12,
    kurtosis: 3.45,
    skewness: 0.23,
    crest_factor: 3.47,
    energy: 45.2,
  };
  const modelScores = currentPrediction?.model_scores ?? {
    autoencoder: 0.15,
    isolation_forest: 0.08,
    lstm: 0.12,
  };

  // Determine health status
  const getHealthStatus = () => {
    if (healthScore >= 0.8) return { label: 'Normal', color: 'green' };
    if (healthScore >= 0.5) return { label: 'Warning', color: 'yellow' };
    return { label: 'Critical', color: 'red' };
  };

  const getRiskLevel = () => {
    if (anomalyScore < 0.3) return { label: 'Low Risk', color: 'blue' };
    if (anomalyScore < 0.6) return { label: 'Medium Risk', color: 'yellow' };
    return { label: 'High Risk', color: 'red' };
  };

  const getTempStatus = () => {
    if (temperature < 45) return { label: 'Normal', color: 'green' };
    if (temperature < 55) return { label: 'Elevated', color: 'yellow' };
    return { label: 'High', color: 'red' };
  };

  const healthStatus = getHealthStatus();
  const riskLevel = getRiskLevel();
  const tempStatus = getTempStatus();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title flex items-center gap-3">
            <Activity className="w-7 h-7 text-blue-400" />
            Real-Time Monitoring
          </h2>
          <p className="text-slate-400 mt-2 text-sm">
            Live vibration analysis and anomaly detection
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-400">Live</span>
        </div>
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="metric-card group">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className={`w-4 h-4 text-${healthStatus.color}-400`} />
            <div className="label-text">Health Score</div>
          </div>
          <div className={`stat-value text-${healthStatus.color}-400`}>
            {healthScore.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 mt-2">{healthStatus.label}</div>
        </div>

        <div className="metric-card group">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={`w-4 h-4 text-${riskLevel.color}-400`} />
            <div className="label-text">Anomaly Score</div>
          </div>
          <div className={`stat-value text-${riskLevel.color}-400`}>
            {anomalyScore.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 mt-2">{riskLevel.label}</div>
        </div>

        <div className="metric-card group">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className={`w-4 h-4 text-${tempStatus.color}-400`} />
            <div className="label-text">Temperature</div>
          </div>
          <div className={`stat-value text-${tempStatus.color}-400`}>
            {temperature.toFixed(1)}°C
          </div>
          <div className="text-xs text-slate-500 mt-2">{tempStatus.label}</div>
        </div>

        <div className="metric-card group">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <div className="label-text">RUL Estimate</div>
          </div>
          <div className="stat-value text-purple-400">{Math.round(rulHours)}h</div>
          <div className="text-xs text-slate-500 mt-2">
            {(rulHours / 24).toFixed(1)} days
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waveform Chart */}
        {currentPrediction?.waveform && (
          <WaveformChart
            data={currentPrediction.waveform}
            title="Live Waveform"
            color="#3b82f6"
            height={300}
          />
        )}

        {/* Frequency Spectrum Chart */}
        {currentPrediction?.spectrum && (
          <SpectrumChart
            frequencies={currentPrediction.spectrum.frequencies}
            magnitudes={currentPrediction.spectrum.magnitudes}
            title="Frequency Spectrum"
            color="#10b981"
            height={300}
            showPeaks={true}
          />
        )}
      </div>

      {/* Feature Values */}
      <div className="section-card">
        <h3 className="section-title mb-4">Feature Values</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'RMS', value: features.rms, unit: 'g' },
            { label: 'Peak', value: features.peak, unit: 'g' },
            { label: 'Kurtosis', value: features.kurtosis, unit: '' },
            { label: 'Skewness', value: features.skewness, unit: '' },
            { label: 'Crest Factor', value: features.crest_factor, unit: '' },
            { label: 'Energy', value: features.energy, unit: 'J' },
          ].map((feature) => (
            <div
              key={feature.label}
              className="bg-slate-900/30 rounded-lg p-4 border border-slate-800/50"
            >
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                {feature.label}
              </div>
              <div className="text-xl font-display font-bold text-slate-200">
                {feature.value.toFixed(2)}
                {feature.unit && (
                  <span className="text-sm text-slate-500 ml-1 font-normal">
                    {feature.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Predictions */}
      <div className="section-card">
        <h3 className="section-title mb-4">Model Predictions</h3>
        <div className="space-y-4">
          {[
            {
              name: 'Autoencoder',
              score: modelScores.autoencoder,
              weight: 0.4,
              color: 'blue',
            },
            {
              name: 'Isolation Forest',
              score: modelScores.isolation_forest,
              weight: 0.3,
              color: 'green',
            },
            { name: 'LSTM', score: modelScores.lstm, weight: 0.3, color: 'purple' },
          ].map((model) => (
            <div key={model.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-300">{model.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-mono">{model.score.toFixed(3)}</span>
                  <span className="text-xs text-slate-600">w: {model.weight}</span>
                </div>
              </div>
              <div className="h-2 bg-slate-900/50 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${model.color}-500 transition-all duration-300`}
                  style={{ width: `${model.score * 100}%` }}
                ></div>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-slate-800/50 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-200">Ensemble Score</span>
              <span className="text-slate-300 font-mono font-bold">{anomalyScore.toFixed(3)}</span>
            </div>
            <div className="h-3 bg-slate-900/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 transition-all duration-300"
                style={{ width: `${anomalyScore * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
