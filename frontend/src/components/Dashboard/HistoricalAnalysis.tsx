/**
 * Historical Analysis Dashboard
 * Trends, patterns, and historical anomaly data
 */

export function HistoricalAnalysis() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <span>📈</span>
            Historical Analysis
          </h2>
          <p className="text-gray-400 mt-1">
            Trends, patterns, and performance over time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-slate-700 text-gray-300 text-sm px-3 py-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Custom Range</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-sm text-gray-400 mb-1">Total Anomalies</div>
          <div className="text-3xl font-bold text-red-400">23</div>
          <div className="text-xs text-green-400 mt-1">↓ 15% from last week</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-sm text-gray-400 mb-1">Avg Health Score</div>
          <div className="text-3xl font-bold text-green-400">0.89</div>
          <div className="text-xs text-yellow-400 mt-1">↓ 3% from last week</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-sm text-gray-400 mb-1">Critical Events</div>
          <div className="text-3xl font-bold text-orange-400">5</div>
          <div className="text-xs text-red-400 mt-1">↑ 2 from last week</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-sm text-gray-400 mb-1">Uptime</div>
          <div className="text-3xl font-bold text-blue-400">99.2%</div>
          <div className="text-xs text-green-400 mt-1">No downtime</div>
        </div>
      </div>

      {/* Health Score Trend */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-200">
            Health Score Trend
          </h3>
          <div className="flex gap-2 text-xs">
            <button className="px-3 py-1 bg-blue-600 text-white rounded">
              Health
            </button>
            <button className="px-3 py-1 bg-slate-700 text-gray-400 rounded hover:bg-slate-600">
              Temperature
            </button>
            <button className="px-3 py-1 bg-slate-700 text-gray-400 rounded hover:bg-slate-600">
              Vibration
            </button>
          </div>
        </div>
        <div className="h-80 flex items-center justify-center bg-slate-900/50 rounded border border-slate-600">
          <div className="text-gray-500 text-center">
            <div className="text-4xl mb-2">📉</div>
            <div className="text-sm">Time series chart</div>
            <div className="text-xs text-gray-600 mt-1">
              Coming in Sprint 3.4
            </div>
          </div>
        </div>
      </div>

      {/* Anomaly Timeline & Feature Correlation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomaly Timeline */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            Anomaly Timeline
          </h3>
          <div className="space-y-3">
            {[
              {
                time: '2h ago',
                severity: 'warning',
                desc: 'Elevated vibration',
              },
              {
                time: '5h ago',
                severity: 'critical',
                desc: 'Temperature spike',
              },
              { time: '12h ago', severity: 'warning', desc: 'Frequency shift' },
              { time: '1d ago', severity: 'normal', desc: 'Minor anomaly' },
              { time: '2d ago', severity: 'critical', desc: 'Bearing stress' },
            ].map((event, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-slate-700/30 rounded border border-slate-600 hover:bg-slate-700/50 transition-colors cursor-pointer"
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    event.severity === 'critical'
                      ? 'bg-red-500'
                      : event.severity === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                ></div>
                <div className="flex-1">
                  <div className="text-sm text-gray-200">{event.desc}</div>
                  <div className="text-xs text-gray-500">{event.time}</div>
                </div>
                <div className="text-xs text-gray-400">→</div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Correlation Heatmap */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            Feature Correlation
          </h3>
          <div className="h-64 flex items-center justify-center bg-slate-900/50 rounded border border-slate-600">
            <div className="text-gray-500 text-center">
              <div className="text-4xl mb-2">🔥</div>
              <div className="text-sm">Correlation heatmap</div>
              <div className="text-xs text-gray-600 mt-1">
                Coming in Sprint 3.4
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Degradation */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Performance Degradation Curve
        </h3>
        <div className="h-64 flex items-center justify-center bg-slate-900/50 rounded border border-slate-600">
          <div className="text-gray-500 text-center">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-sm">Degradation trend visualization</div>
            <div className="text-xs text-gray-600 mt-1">
              Coming in Sprint 3.4
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
