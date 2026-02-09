/**
 * Anomaly Details Dashboard
 * Root cause analysis and detailed anomaly information
 */

export function AnomalyDetails() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <span>🔍</span>
            Anomaly Details
          </h2>
          <p className="text-gray-400 mt-1">
            Root cause analysis and detailed insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-slate-700 text-gray-300 text-sm rounded border border-slate-600 hover:bg-slate-600 transition-colors">
            View All Anomalies
          </button>
        </div>
      </div>

      {/* Current Anomaly Alert */}
      <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-lg p-6 border border-red-500/30">
        <div className="flex items-start gap-4">
          <div className="text-5xl">⚠️</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-red-400">
                Critical Anomaly Detected
              </h3>
              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                CRITICAL
              </span>
            </div>
            <p className="text-gray-300 mb-3">
              High-frequency vibration spike detected at 2.4 kHz, significantly
              above baseline threshold. Immediate inspection recommended.
            </p>
            <div className="flex gap-4 text-sm">
              <div className="text-gray-400">
                Detected: <span className="text-gray-200">2 hours ago</span>
              </div>
              <div className="text-gray-400">
                Severity:{' '}
                <span className="text-red-400 font-semibold">9.2/10</span>
              </div>
              <div className="text-gray-400">
                Confidence:{' '}
                <span className="text-green-400 font-semibold">94%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Root Cause Analysis */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Root Cause Analysis
        </h3>
        <div className="space-y-4">
          {/* Primary Cause */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="text-sm font-semibold text-gray-200">
                Primary Cause (87% attribution)
              </div>
            </div>
            <div className="text-gray-300 mb-2">
              Vibration spike at 2.4 kHz frequency band
            </div>
            <div className="flex gap-4 text-xs text-gray-400">
              <div>
                Baseline: <span className="text-gray-300">0.8 g</span>
              </div>
              <div>
                Current: <span className="text-red-400">2.7 g</span>
              </div>
              <div>
                Increase: <span className="text-red-400">+340%</span>
              </div>
            </div>
          </div>

          {/* Contributing Factors */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="text-sm font-semibold text-gray-200">
                Contributing Factors
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Elevated temperature</span>
                <span className="text-yellow-400">+8% attribution</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Increased kurtosis</span>
                <span className="text-yellow-400">+3% attribution</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Spectral spread</span>
                <span className="text-yellow-400">+2% attribution</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Contributions & Frequency Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Contributions (SHAP-like) */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            Feature Importance (SHAP)
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Band Power 2-5kHz', impact: 0.87, direction: 'high' },
              { name: 'Peak Value', impact: 0.45, direction: 'high' },
              { name: 'Kurtosis', impact: 0.32, direction: 'high' },
              { name: 'RMS', impact: 0.28, direction: 'high' },
              { name: 'Spectral Centroid', impact: 0.15, direction: 'low' },
            ].map((feature) => (
              <div key={feature.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{feature.name}</span>
                  <span
                    className={`${
                      feature.direction === 'high'
                        ? 'text-red-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {feature.impact.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      feature.direction === 'high'
                        ? 'bg-red-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${feature.impact * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Frequency Band Analysis */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            Frequency Band Analysis
          </h3>
          <div className="h-64 flex items-center justify-center bg-slate-900/50 rounded border border-slate-600">
            <div className="text-gray-500 text-center">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-sm">Frequency spectrum at anomaly time</div>
              <div className="text-xs text-gray-600 mt-1">
                Coming in Sprint 3.4
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Recommended Actions
        </h3>
        <div className="space-y-3">
          {[
            {
              priority: 'high',
              action: 'Schedule immediate bearing inspection',
              reason: 'High-frequency vibration indicates potential bearing damage',
            },
            {
              priority: 'high',
              action: 'Monitor temperature closely',
              reason: 'Temperature trending upward, may exacerbate issue',
            },
            {
              priority: 'medium',
              action: 'Review maintenance logs',
              reason: 'Check for recent changes or service activities',
            },
            {
              priority: 'low',
              action: 'Plan replacement parts procurement',
              reason: 'Estimated RUL suggests replacement within 72 hours',
            },
          ].map((rec, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-4 bg-slate-700/30 rounded border border-slate-600"
            >
              <div
                className={`px-2 py-1 h-fit rounded text-xs font-semibold ${
                  rec.priority === 'high'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : rec.priority === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {rec.priority.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-200 mb-1">
                  {rec.action}
                </div>
                <div className="text-xs text-gray-400">{rec.reason}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Similar Past Events */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Similar Past Events
        </h3>
        <div className="space-y-2">
          {[
            { date: '2025-12-15', severity: 8.9, outcome: 'Bearing replaced' },
            { date: '2025-11-03', severity: 8.1, outcome: 'False positive' },
            { date: '2025-09-22', severity: 9.5, outcome: 'Emergency shutdown' },
          ].map((event, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-slate-700/30 rounded border border-slate-600 hover:bg-slate-700/50 transition-colors cursor-pointer"
            >
              <div className="text-sm text-gray-300">{event.date}</div>
              <div className="text-sm text-gray-400">
                Severity: {event.severity}/10
              </div>
              <div className="text-sm text-gray-300">{event.outcome}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
