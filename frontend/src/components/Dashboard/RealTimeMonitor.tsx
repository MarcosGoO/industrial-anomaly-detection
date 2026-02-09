/**
 * Real-Time Monitoring Dashboard
 * Live vibration monitoring, spectrum, and health status
 */

export function RealTimeMonitor() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <span>📊</span>
            Real-Time Monitoring
          </h2>
          <p className="text-gray-400 mt-1">
            Live vibration analysis and anomaly detection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">Live</span>
        </div>
      </div>

      {/* Health Status Card */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          System Health
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="text-sm text-gray-400 mb-1">Health Score</div>
            <div className="text-3xl font-bold text-green-400">0.95</div>
            <div className="text-xs text-gray-500 mt-1">Normal</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="text-sm text-gray-400 mb-1">Anomaly Score</div>
            <div className="text-3xl font-bold text-blue-400">0.12</div>
            <div className="text-xs text-gray-500 mt-1">Low risk</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="text-sm text-gray-400 mb-1">Temperature</div>
            <div className="text-3xl font-bold text-yellow-400">42°C</div>
            <div className="text-xs text-gray-500 mt-1">Within range</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="text-sm text-gray-400 mb-1">RUL Estimate</div>
            <div className="text-3xl font-bold text-purple-400">156h</div>
            <div className="text-xs text-gray-500 mt-1">6.5 days</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waveform Chart */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            Live Waveform
          </h3>
          <div className="h-64 flex items-center justify-center bg-slate-900/50 rounded border border-slate-600">
            <div className="text-gray-500 text-center">
              <div className="text-4xl mb-2">〰️</div>
              <div className="text-sm">Waveform visualization</div>
              <div className="text-xs text-gray-600 mt-1">
                Coming in Sprint 3.4
              </div>
            </div>
          </div>
        </div>

        {/* Frequency Spectrum Chart */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            Frequency Spectrum
          </h3>
          <div className="h-64 flex items-center justify-center bg-slate-900/50 rounded border border-slate-600">
            <div className="text-gray-500 text-center">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-sm">FFT spectrum visualization</div>
              <div className="text-xs text-gray-600 mt-1">
                Coming in Sprint 3.4
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Values */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Feature Values
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'RMS', value: '2.34', unit: 'g' },
            { label: 'Peak', value: '8.12', unit: 'g' },
            { label: 'Kurtosis', value: '3.45', unit: '' },
            { label: 'Skewness', value: '0.23', unit: '' },
            { label: 'Crest Factor', value: '3.47', unit: '' },
            { label: 'Energy', value: '45.2', unit: 'J' },
          ].map((feature) => (
            <div
              key={feature.label}
              className="bg-slate-700/30 rounded p-3 border border-slate-600"
            >
              <div className="text-xs text-gray-400">{feature.label}</div>
              <div className="text-lg font-bold text-gray-200">
                {feature.value}
                {feature.unit && (
                  <span className="text-sm text-gray-500 ml-1">
                    {feature.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Predictions */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Model Predictions
        </h3>
        <div className="space-y-3">
          {[
            { name: 'Autoencoder', score: 0.15, weight: 0.4, color: 'blue' },
            {
              name: 'Isolation Forest',
              score: 0.08,
              weight: 0.3,
              color: 'green',
            },
            { name: 'LSTM', score: 0.12, weight: 0.3, color: 'purple' },
          ].map((model) => (
            <div key={model.name} className="flex items-center gap-4">
              <div className="w-32 text-sm text-gray-300">{model.name}</div>
              <div className="flex-1">
                <div className="h-6 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-${model.color}-500 transition-all duration-300`}
                    style={{ width: `${model.score * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-16 text-sm text-gray-400 text-right">
                {model.score.toFixed(2)}
              </div>
              <div className="w-16 text-xs text-gray-500 text-right">
                w: {model.weight}
              </div>
            </div>
          ))}
          <div className="pt-3 border-t border-slate-700 flex items-center gap-4">
            <div className="w-32 text-sm font-semibold text-gray-200">
              Ensemble
            </div>
            <div className="flex-1">
              <div className="h-8 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 transition-all duration-300"
                  style={{ width: '12%' }}
                ></div>
              </div>
            </div>
            <div className="w-16 text-sm font-bold text-gray-200 text-right">
              0.12
            </div>
            <div className="w-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
