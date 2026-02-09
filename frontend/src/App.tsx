/**
 * Main Application Component
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { queryClient } from './services/queryClient';
import { useHealthCheck } from './hooks/useHealthCheck';
import { useAppStore } from './store/useAppStore';
import { DashboardLayout } from './components/Layout';
import {
  RealTimeMonitor,
  HistoricalAnalysis,
  AnomalyDetails,
  SystemPerformance,
} from './components/Dashboard';

function AppContent() {
  const { isLoading, error } = useHealthCheck();
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
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<RealTimeMonitor />} />
          <Route path="/historical" element={<HistoricalAnalysis />} />
          <Route path="/anomalies" element={<AnomalyDetails />} />
          <Route path="/system" element={<SystemPerformance />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}