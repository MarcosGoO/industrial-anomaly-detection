/**
 * Main Application Component
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryClient';
import { useHealthCheck } from './hooks/useHealthCheck';
import { useAppStore } from './store/useAppStore';

function AppContent() {
  const { data: health, isLoading, error } = useHealthCheck();
  const isConnected = useAppStore((state) => state.isConnected);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-300">Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (error || !isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center max-w-md mx-auto p-6 bg-slate-800 rounded-lg border border-red-500/30">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-100 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-400 mb-4">
            Unable to connect to the backend API. Please ensure the server is
            running at <code className="text-blue-400">http://localhost:8000</code>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚙️</div>
            <div>
              <h1 className="text-xl font-bold text-gray-100">
                Industrial Anomaly Detection System
              </h1>
              <p className="text-sm text-gray-400">
                Real-time monitoring for rotating machinery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {health && (
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    health.status === 'healthy'
                      ? 'bg-green-500'
                      : health.status === 'degraded'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  } animate-pulse`}
                ></div>
                <span className="text-sm text-gray-300 capitalize">
                  {health.status}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-gray-100 mb-4">
            🚀 System Ready
          </h2>
          <p className="text-gray-300 mb-6">
            The Industrial Anomaly Detection System is successfully connected
            and running. The dashboard is ready for Sprint 3 implementation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="text-sm text-gray-400 mb-1">Loaded Models</div>
              <div className="text-2xl font-bold text-blue-400">
                {health?.models.length || 0}
              </div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="text-sm text-gray-400 mb-1">System Status</div>
              <div className="text-2xl font-bold text-green-400 capitalize">
                {health?.status || 'Unknown'}
              </div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="text-sm text-gray-400 mb-1">API Version</div>
              <div className="text-2xl font-bold text-purple-400">1.0.0</div>
            </div>
          </div>

          {health && (
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
              <h3 className="text-lg font-semibold text-gray-200 mb-3">
                Model Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {health.models.map((model) => (
                  <div
                    key={model.name}
                    className="bg-slate-800 rounded p-3 border border-slate-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300 capitalize">
                        {model.name.replace('_', ' ')}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          model.loaded
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {model.loaded ? 'Loaded' : 'Not Loaded'}
                      </span>
                    </div>
                    {model.threshold !== null && (
                      <div className="text-xs text-gray-500">
                        Threshold: {model.threshold.toFixed(4)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-600">
                <div className="text-sm text-gray-400 mb-2">Ensemble Weights</div>
                <div className="flex gap-4 text-xs">
                  <span className="text-gray-300">
                    Autoencoder:{' '}
                    <span className="text-blue-400">
                      {health.ensemble_config.weights.autoencoder}
                    </span>
                  </span>
                  <span className="text-gray-300">
                    Isolation Forest:{' '}
                    <span className="text-green-400">
                      {health.ensemble_config.weights.isolation_forest}
                    </span>
                  </span>
                  <span className="text-gray-300">
                    LSTM:{' '}
                    <span className="text-purple-400">
                      {health.ensemble_config.weights.lstm}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}