/**
 * Anomaly Details Dashboard
 * Root cause analysis and detailed anomaly information
 */

import {
  AlertTriangle,
  Search,
  TrendingUp,
  BarChart3,
  Clock,
  Target,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export function AnomalyDetails() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title flex items-center gap-3">
            <Search className="w-7 h-7 text-blue-400" />
            Anomaly Details
          </h2>
          <p className="text-slate-400 mt-2 text-sm">
            Root cause analysis and detailed insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-slate-700/50 backdrop-blur-sm text-slate-300 text-sm rounded-lg border border-slate-600/50 hover:bg-slate-700 hover:border-slate-500 transition-all">
            View All Anomalies
          </button>
        </div>
      </div>

      {/* Current Anomaly Alert */}
      <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 backdrop-blur-sm rounded-lg p-6 border border-red-500/30">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-display font-semibold text-red-400">
                Critical Anomaly Detected
              </h3>
              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/30 uppercase tracking-wider">
                Critical
              </span>
            </div>
            <p className="text-slate-300 mb-4 leading-relaxed">
              High-frequency vibration spike detected at 2.4 kHz, significantly
              above baseline threshold. Immediate inspection recommended.
            </p>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400">Detected:</span>
                <span className="text-slate-200 font-medium">2 hours ago</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-red-400" />
                <span className="text-slate-400">Severity:</span>
                <span className="text-red-400 font-semibold">9.2/10</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-slate-400">Confidence:</span>
                <span className="text-green-400 font-semibold">94%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Root Cause Analysis */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-6">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <h3 className="section-title">Root Cause Analysis</h3>
        </div>
        <div className="space-y-4">
          {/* Primary Cause */}
          <div className="bg-slate-700/50 backdrop-blur-sm rounded-lg p-5 border border-slate-600/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
              <div className="text-sm font-semibold text-slate-200">
                Primary Cause (87% attribution)
              </div>
            </div>
            <div className="text-slate-300 mb-3 font-medium">
              Vibration spike at 2.4 kHz frequency band
            </div>
            <div className="flex gap-6 text-xs">
              <div className="text-slate-400">
                Baseline: <span className="text-slate-300 font-medium">0.8 g</span>
              </div>
              <div className="text-slate-400">
                Current: <span className="text-red-400 font-semibold">2.7 g</span>
              </div>
              <div className="text-slate-400">
                Increase: <span className="text-red-400 font-semibold">+340%</span>
              </div>
            </div>
          </div>

          {/* Contributing Factors */}
          <div className="bg-slate-700/50 backdrop-blur-sm rounded-lg p-5 border border-slate-600/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
              <div className="text-sm font-semibold text-slate-200">
                Contributing Factors
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-medium">Elevated temperature</span>
                <span className="text-yellow-400 font-semibold">+8% attribution</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-medium">Increased kurtosis</span>
                <span className="text-yellow-400 font-semibold">+3% attribution</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-medium">Spectral spread</span>
                <span className="text-yellow-400 font-semibold">+2% attribution</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Contributions & Frequency Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Contributions (SHAP-like) */}
        <div className="section-card">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="section-title">Feature Importance (SHAP)</h3>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Band Power 2-5kHz', impact: 0.87, direction: 'high' },
              { name: 'Peak Value', impact: 0.45, direction: 'high' },
              { name: 'Kurtosis', impact: 0.32, direction: 'high' },
              { name: 'RMS', impact: 0.28, direction: 'high' },
              { name: 'Spectral Centroid', impact: 0.15, direction: 'low' },
            ].map((feature) => (
              <div key={feature.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 font-medium">{feature.name}</span>
                  <span
                    className={`font-semibold ${
                      feature.direction === 'high'
                        ? 'text-red-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {feature.impact.toFixed(2)}
                  </span>
                </div>
                <div className="h-2.5 bg-slate-700/50 backdrop-blur-sm rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
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
        <div className="section-card">
          <h3 className="section-title mb-4">Frequency Band Analysis</h3>
          <div className="h-64 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-lg border border-slate-700/50">
            <div className="text-slate-500 text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <div className="text-sm font-medium text-slate-400">
                Frequency spectrum at anomaly time
              </div>
              <div className="text-xs text-slate-600 mt-2">
                Coming in Sprint 3.4
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="section-card">
        <h3 className="section-title mb-6">Recommended Actions</h3>
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
              className="flex gap-4 p-4 bg-slate-700/30 backdrop-blur-sm rounded-lg border border-slate-600/50 hover:border-slate-500 transition-all"
            >
              <div
                className={`px-2.5 py-1 h-fit rounded-md text-xs font-bold uppercase tracking-wider ${
                  rec.priority === 'high'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : rec.priority === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {rec.priority}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-200 mb-1.5">
                  {rec.action}
                </div>
                <div className="text-xs text-slate-400 leading-relaxed">{rec.reason}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Similar Past Events */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-purple-400" />
          <h3 className="section-title">Similar Past Events</h3>
        </div>
        <div className="space-y-3">
          {[
            { date: '2025-12-15', severity: 8.9, outcome: 'Bearing replaced' },
            { date: '2025-11-03', severity: 8.1, outcome: 'False positive' },
            { date: '2025-09-22', severity: 9.5, outcome: 'Emergency shutdown' },
          ].map((event, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-slate-700/30 backdrop-blur-sm rounded-lg border border-slate-600/50 hover:bg-slate-700/50 hover:border-slate-500 transition-all cursor-pointer"
            >
              <div className="text-sm font-medium text-slate-300">{event.date}</div>
              <div className="text-sm text-slate-400">
                Severity: <span className="font-semibold text-orange-400">{event.severity}/10</span>
              </div>
              <div className="text-sm font-medium text-slate-300">{event.outcome}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
