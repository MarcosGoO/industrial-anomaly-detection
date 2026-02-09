/**
 * System Performance Dashboard
 * Model metrics, inference stats, and system health
 */

import {
  Settings,
  Activity,
  Cpu,
  HardDrive,
  Zap,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Download,
} from 'lucide-react';

export function SystemPerformance() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title flex items-center gap-3">
            <Settings className="w-7 h-7 text-blue-400" />
            System Performance
          </h2>
          <p className="text-slate-400 mt-2 text-sm">
            Model metrics, inference stats, and resource usage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-blue-600/20 backdrop-blur-sm text-blue-400 text-sm rounded-lg border border-blue-500/30 hover:bg-blue-600/30 hover:border-blue-500/50 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-400" />
            <div className="label-text">Model Accuracy</div>
          </div>
          <div className="stat-value text-green-400">94.2%</div>
          <div className="text-xs text-green-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            1.2% this week
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <div className="label-text">Avg Latency</div>
          </div>
          <div className="stat-value text-blue-400">28ms</div>
          <div className="text-xs text-green-400 mt-2">Well within target</div>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-yellow-400" />
            <div className="label-text">CPU Usage</div>
          </div>
          <div className="stat-value text-yellow-400">35%</div>
          <div className="text-xs text-slate-400 mt-2">Avg over 24h</div>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-4 h-4 text-purple-400" />
            <div className="label-text">Memory Usage</div>
          </div>
          <div className="stat-value text-purple-400">1.2GB</div>
          <div className="text-xs text-slate-400 mt-2">40% allocated</div>
        </div>
      </div>

      {/* Model Metrics */}
      <div className="section-card">
        <h3 className="section-title mb-6">Model Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Autoencoder',
              precision: 0.92,
              recall: 0.88,
              f1: 0.9,
              color: 'blue',
            },
            {
              name: 'Isolation Forest',
              precision: 0.89,
              recall: 0.91,
              f1: 0.9,
              color: 'green',
            },
            {
              name: 'LSTM',
              precision: 0.94,
              recall: 0.86,
              f1: 0.9,
              color: 'purple',
            },
          ].map((model) => (
            <div
              key={model.name}
              className="bg-slate-700/50 backdrop-blur-sm rounded-lg p-5 border border-slate-600/50 hover:border-slate-500 transition-all"
            >
              <div className="text-sm font-semibold text-slate-200 mb-4">
                {model.name}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Precision</span>
                  <span className="text-slate-200 font-semibold">
                    {(model.precision * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Recall</span>
                  <span className="text-slate-200 font-semibold">
                    {(model.recall * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">F1 Score</span>
                  <span className={`text-${model.color}-400 font-bold`}>
                    {(model.f1 * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ensemble Performance */}
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-5 border border-slate-600/50">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-slate-200">
                Ensemble (Combined)
              </div>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30 uppercase tracking-wider">
                Best
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Precision</div>
                <div className="text-lg font-bold text-green-400">93.1%</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Recall</div>
                <div className="text-lg font-bold text-green-400">89.7%</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider">F1 Score</div>
                <div className="text-lg font-bold text-green-400">91.4%</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider">FPR</div>
                <div className="text-lg font-bold text-blue-400">3.2%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confusion Matrix & Inference Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <div className="section-card">
          <h3 className="section-title mb-6">Confusion Matrix (Last 7 Days)</h3>
          <div className="aspect-square max-w-sm mx-auto">
            <div className="grid grid-cols-2 gap-3 h-full">
              <div className="bg-green-500/20 backdrop-blur-sm border-2 border-green-500/40 rounded-lg flex flex-col items-center justify-center hover:bg-green-500/30 transition-all">
                <div className="text-4xl font-display font-bold text-green-400">842</div>
                <div className="text-xs text-slate-400 mt-2 uppercase tracking-wider">True Negative</div>
              </div>
              <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-500/40 rounded-lg flex flex-col items-center justify-center hover:bg-red-500/30 transition-all">
                <div className="text-4xl font-display font-bold text-red-400">28</div>
                <div className="text-xs text-slate-400 mt-2 uppercase tracking-wider">False Positive</div>
              </div>
              <div className="bg-yellow-500/20 backdrop-blur-sm border-2 border-yellow-500/40 rounded-lg flex flex-col items-center justify-center hover:bg-yellow-500/30 transition-all">
                <div className="text-4xl font-display font-bold text-yellow-400">12</div>
                <div className="text-xs text-slate-400 mt-2 uppercase tracking-wider">False Negative</div>
              </div>
              <div className="bg-blue-500/20 backdrop-blur-sm border-2 border-blue-500/40 rounded-lg flex flex-col items-center justify-center hover:bg-blue-500/30 transition-all">
                <div className="text-4xl font-display font-bold text-blue-400">98</div>
                <div className="text-xs text-slate-400 mt-2 uppercase tracking-wider">True Positive</div>
              </div>
            </div>
          </div>
        </div>

        {/* Inference Performance */}
        <div className="section-card">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="section-title">Inference Performance</h3>
          </div>
          <div className="space-y-6">
            {/* Latency Distribution */}
            <div>
              <div className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
                Latency Distribution
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 text-xs font-semibold text-slate-400">P50</div>
                  <div className="flex-1 h-7 bg-slate-700/50 backdrop-blur-sm rounded-full overflow-hidden border border-slate-600/50">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: '56%' }}
                    ></div>
                  </div>
                  <div className="w-16 text-sm font-semibold text-slate-300 text-right">
                    28ms
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 text-xs font-semibold text-slate-400">P95</div>
                  <div className="flex-1 h-7 bg-slate-700/50 backdrop-blur-sm rounded-full overflow-hidden border border-slate-600/50">
                    <div
                      className="h-full bg-yellow-500 transition-all duration-500"
                      style={{ width: '82%' }}
                    ></div>
                  </div>
                  <div className="w-16 text-sm font-semibold text-slate-300 text-right">
                    41ms
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 text-xs font-semibold text-slate-400">P99</div>
                  <div className="flex-1 h-7 bg-slate-700/50 backdrop-blur-sm rounded-full overflow-hidden border border-slate-600/50">
                    <div
                      className="h-full bg-red-500 transition-all duration-500"
                      style={{ width: '96%' }}
                    ></div>
                  </div>
                  <div className="w-16 text-sm font-semibold text-slate-300 text-right">
                    48ms
                  </div>
                </div>
              </div>
            </div>

            {/* Throughput */}
            <div>
              <div className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Throughput</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/50 backdrop-blur-sm rounded-lg p-4 border border-slate-600/50 hover:border-slate-500 transition-all">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Predictions/sec</div>
                  <div className="text-2xl font-bold text-blue-400 mt-1">35.7</div>
                </div>
                <div className="bg-slate-700/50 backdrop-blur-sm rounded-lg p-4 border border-slate-600/50 hover:border-slate-500 transition-all">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Total today</div>
                  <div className="text-2xl font-bold text-green-400 mt-1">2.1M</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Usage & Drift Detection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Usage */}
        <div className="section-card">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-yellow-400" />
            <h3 className="section-title">Resource Usage (24h)</h3>
          </div>
          <div className="h-48 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-lg border border-slate-700/50">
            <div className="text-slate-500 text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <div className="text-sm font-medium text-slate-400">
                CPU & Memory usage chart
              </div>
              <div className="text-xs text-slate-600 mt-2">
                Coming in Sprint 3.4
              </div>
            </div>
          </div>
        </div>

        {/* Drift Detection */}
        <div className="section-card">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-green-400" />
            <h3 className="section-title">Drift Detection Status</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <div className="text-sm font-semibold text-green-400">
                  No Drift Detected
                </div>
              </div>
              <div className="text-xs text-slate-400 leading-relaxed">
                Data distribution remains stable. Models performing as expected.
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                Distribution Similarity
              </div>
              {[
                { feature: 'Vibration RMS', similarity: 0.97 },
                { feature: 'Temperature', similarity: 0.94 },
                { feature: 'Frequency bands', similarity: 0.92 },
              ].map((item) => (
                <div key={item.feature} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">{item.feature}</span>
                    <span className="text-green-400 font-semibold">
                      {(item.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-700/50 backdrop-blur-sm rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${item.similarity * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-700/50">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Next retraining check</div>
              <div className="text-sm font-semibold text-slate-200 mt-1">In 5 days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Retraining Recommendations */}
      <div className="section-card">
        <h3 className="section-title mb-6">Retraining Recommendations</h3>
        <div className="bg-slate-700/30 backdrop-blur-sm border border-slate-600/50 rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/30">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-200 mb-2">
                Models are performing optimally
              </div>
              <div className="text-sm text-slate-400 mb-4 leading-relaxed">
                All metrics within acceptable ranges. No retraining required at
                this time.
              </div>
              <div className="flex gap-3 text-xs flex-wrap">
                <div className="bg-slate-800/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-600/50">
                  Last trained: <span className="text-slate-200 font-medium">14 days ago</span>
                </div>
                <div className="bg-slate-800/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-600/50">
                  Training samples:{' '}
                  <span className="text-slate-200 font-medium">1.2M</span>
                </div>
                <div className="bg-slate-800/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-600/50">
                  Validation accuracy:{' '}
                  <span className="text-green-400 font-semibold">94.2%</span>
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-slate-700/50 backdrop-blur-sm text-slate-300 text-sm rounded-lg border border-slate-600/50 hover:bg-slate-700 hover:border-slate-500 hover:text-slate-200 transition-all">
              Force Retrain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
