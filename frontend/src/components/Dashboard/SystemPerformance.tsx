/**
 * System Performance Dashboard
 * Model metrics, inference stats, and system health
 */

export function SystemPerformance() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <span>⚙️</span>
            System Performance
          </h2>
          <p className="text-gray-400 mt-1">
            Model metrics, inference stats, and resource usage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-sm text-gray-400 mb-1">Model Accuracy</div>
          <div className="text-3xl font-bold text-green-400">94.2%</div>
          <div className="text-xs text-green-400 mt-1">↑ 1.2% this week</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-sm text-gray-400 mb-1">Avg Latency</div>
          <div className="text-3xl font-bold text-blue-400">28ms</div>
          <div className="text-xs text-green-400 mt-1">Well within target</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-sm text-gray-400 mb-1">CPU Usage</div>
          <div className="text-3xl font-bold text-yellow-400">35%</div>
          <div className="text-xs text-gray-400 mt-1">Avg over 24h</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-sm text-gray-400 mb-1">Memory Usage</div>
          <div className="text-3xl font-bold text-purple-400">1.2GB</div>
          <div className="text-xs text-gray-400 mt-1">40% allocated</div>
        </div>
      </div>

      {/* Model Metrics */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Model Performance Metrics
        </h3>
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
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div className="text-sm font-semibold text-gray-200 mb-3">
                {model.name}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Precision</span>
                  <span className="text-gray-200 font-medium">
                    {(model.precision * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Recall</span>
                  <span className="text-gray-200 font-medium">
                    {(model.recall * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">F1 Score</span>
                  <span className={`text-${model.color}-400 font-bold`}>
                    {(model.f1 * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ensemble Performance */}
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-200">
                Ensemble (Combined)
              </div>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                BEST
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-400 mb-1">Precision</div>
                <div className="text-lg font-bold text-green-400">93.1%</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Recall</div>
                <div className="text-lg font-bold text-green-400">89.7%</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">F1 Score</div>
                <div className="text-lg font-bold text-green-400">91.4%</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">FPR</div>
                <div className="text-lg font-bold text-blue-400">3.2%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confusion Matrix & Inference Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            Confusion Matrix (Last 7 Days)
          </h3>
          <div className="aspect-square max-w-sm mx-auto">
            <div className="grid grid-cols-2 gap-2 h-full">
              <div className="bg-green-500/20 border-2 border-green-500/40 rounded-lg flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-green-400">842</div>
                <div className="text-xs text-gray-400 mt-1">True Negative</div>
              </div>
              <div className="bg-red-500/20 border-2 border-red-500/40 rounded-lg flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-red-400">28</div>
                <div className="text-xs text-gray-400 mt-1">False Positive</div>
              </div>
              <div className="bg-yellow-500/20 border-2 border-yellow-500/40 rounded-lg flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-yellow-400">12</div>
                <div className="text-xs text-gray-400 mt-1">False Negative</div>
              </div>
              <div className="bg-blue-500/20 border-2 border-blue-500/40 rounded-lg flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-blue-400">98</div>
                <div className="text-xs text-gray-400 mt-1">True Positive</div>
              </div>
            </div>
          </div>
        </div>

        {/* Inference Performance */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            Inference Performance
          </h3>
          <div className="space-y-4">
            {/* Latency Distribution */}
            <div>
              <div className="text-sm text-gray-400 mb-2">
                Latency Distribution
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-16 text-xs text-gray-400">P50</div>
                  <div className="flex-1 h-6 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: '56%' }}
                    ></div>
                  </div>
                  <div className="w-16 text-sm text-gray-300 text-right">
                    28ms
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 text-xs text-gray-400">P95</div>
                  <div className="flex-1 h-6 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500"
                      style={{ width: '82%' }}
                    ></div>
                  </div>
                  <div className="w-16 text-sm text-gray-300 text-right">
                    41ms
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 text-xs text-gray-400">P99</div>
                  <div className="flex-1 h-6 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{ width: '96%' }}
                    ></div>
                  </div>
                  <div className="w-16 text-sm text-gray-300 text-right">
                    48ms
                  </div>
                </div>
              </div>
            </div>

            {/* Throughput */}
            <div>
              <div className="text-sm text-gray-400 mb-2">Throughput</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/50 rounded p-3 border border-slate-600">
                  <div className="text-xs text-gray-400">Predictions/sec</div>
                  <div className="text-2xl font-bold text-blue-400">35.7</div>
                </div>
                <div className="bg-slate-700/50 rounded p-3 border border-slate-600">
                  <div className="text-xs text-gray-400">Total today</div>
                  <div className="text-2xl font-bold text-green-400">2.1M</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Usage & Drift Detection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Usage */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            Resource Usage (24h)
          </h3>
          <div className="h-48 flex items-center justify-center bg-slate-900/50 rounded border border-slate-600">
            <div className="text-gray-500 text-center">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-sm">CPU & Memory usage chart</div>
              <div className="text-xs text-gray-600 mt-1">
                Coming in Sprint 3.4
              </div>
            </div>
          </div>
        </div>

        {/* Drift Detection */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            Drift Detection Status
          </h3>
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="text-sm font-semibold text-green-400">
                  No Drift Detected
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Data distribution remains stable. Models performing as expected.
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-400 mb-2">
                Distribution Similarity
              </div>
              {[
                { feature: 'Vibration RMS', similarity: 0.97 },
                { feature: 'Temperature', similarity: 0.94 },
                { feature: 'Frequency bands', similarity: 0.92 },
              ].map((item) => (
                <div key={item.feature} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{item.feature}</span>
                    <span className="text-green-400">
                      {(item.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${item.similarity * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-700">
              <div className="text-xs text-gray-400">Next retraining check</div>
              <div className="text-sm text-gray-200 mt-1">In 5 days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Retraining Recommendations */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Retraining Recommendations
        </h3>
        <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="text-3xl">✅</div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-200 mb-1">
                Models are performing optimally
              </div>
              <div className="text-sm text-gray-400 mb-3">
                All metrics within acceptable ranges. No retraining required at
                this time.
              </div>
              <div className="flex gap-3 text-xs">
                <div className="bg-slate-800 px-3 py-1 rounded border border-slate-600">
                  Last trained: <span className="text-gray-200">14 days ago</span>
                </div>
                <div className="bg-slate-800 px-3 py-1 rounded border border-slate-600">
                  Training samples:{' '}
                  <span className="text-gray-200">1.2M</span>
                </div>
                <div className="bg-slate-800 px-3 py-1 rounded border border-slate-600">
                  Validation accuracy:{' '}
                  <span className="text-green-400">94.2%</span>
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-slate-700 text-gray-300 text-sm rounded border border-slate-600 hover:bg-slate-600 transition-colors">
              Force Retrain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
