/**
 * Historical Analysis Dashboard
 * Trends, patterns, and historical anomaly data
 */

import {
  TrendingUp,
  AlertTriangle,
  Activity,
  BarChart3,
  Calendar,
} from 'lucide-react';

export function HistoricalAnalysis() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-blue-400" />
            Historical Analysis
          </h2>
          <p className="text-slate-400 mt-2 text-sm">
            Trends, patterns, and performance over time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select className="bg-slate-700/50 backdrop-blur-sm text-slate-300 text-sm px-3 py-2 rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all">
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Custom Range</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="label-text mb-2">Total Anomalies</div>
          <div className="stat-value text-red-400">23</div>
          <div className="text-xs text-green-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 rotate-180" />
            15% from last week
          </div>
        </div>
        <div className="metric-card">
          <div className="label-text mb-2">Avg Health Score</div>
          <div className="stat-value text-green-400">0.89</div>
          <div className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 rotate-180" />
            3% from last week
          </div>
        </div>
        <div className="metric-card">
          <div className="label-text mb-2">Critical Events</div>
          <div className="stat-value text-orange-400">5</div>
          <div className="text-xs text-red-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            2 from last week
          </div>
        </div>
        <div className="metric-card">
          <div className="label-text mb-2">Uptime</div>
          <div className="stat-value text-blue-400">99.2%</div>
          <div className="text-xs text-green-400 mt-2">No downtime</div>
        </div>
      </div>

      {/* Health Score Trend */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="section-title">Health Score Trend</h3>
          <div className="flex gap-2 text-xs">
            <button className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30 font-medium">
              Health
            </button>
            <button className="px-3 py-1.5 bg-slate-700/50 text-slate-400 rounded-lg border border-slate-600/50 hover:bg-slate-700 hover:text-slate-300 transition-all">
              Temperature
            </button>
            <button className="px-3 py-1.5 bg-slate-700/50 text-slate-400 rounded-lg border border-slate-600/50 hover:bg-slate-700 hover:text-slate-300 transition-all">
              Vibration
            </button>
          </div>
        </div>
        <div className="h-80 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-lg border border-slate-700/50">
          <div className="text-slate-500 text-center">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <div className="text-sm font-medium text-slate-400">
              Time series chart
            </div>
            <div className="text-xs text-slate-600 mt-2">
              Coming in Sprint 3.4
            </div>
          </div>
        </div>
      </div>

      {/* Anomaly Timeline & Feature Correlation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomaly Timeline */}
        <div className="section-card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h3 className="section-title">Anomaly Timeline</h3>
          </div>
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
                className="flex items-center gap-3 p-3 bg-slate-700/30 backdrop-blur-sm rounded-lg border border-slate-600/50 hover:bg-slate-700/50 hover:border-slate-500 transition-all cursor-pointer group"
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    event.severity === 'critical'
                      ? 'bg-red-500'
                      : event.severity === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                ></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-200">
                    {event.desc}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {event.time}
                  </div>
                </div>
                <div className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  →
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Correlation Heatmap */}
        <div className="section-card">
          <h3 className="section-title mb-4">Feature Correlation</h3>
          <div className="h-64 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-lg border border-slate-700/50">
            <div className="text-slate-500 text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <div className="text-sm font-medium text-slate-400">
                Correlation heatmap
              </div>
              <div className="text-xs text-slate-600 mt-2">
                Coming in Sprint 3.4
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Degradation */}
      <div className="section-card">
        <h3 className="section-title mb-4">Performance Degradation Curve</h3>
        <div className="h-64 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-lg border border-slate-700/50">
          <div className="text-slate-500 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50 rotate-180" />
            <div className="text-sm font-medium text-slate-400">
              Degradation trend visualization
            </div>
            <div className="text-xs text-slate-600 mt-2">
              Coming in Sprint 3.4
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
