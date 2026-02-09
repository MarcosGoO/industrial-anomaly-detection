/**
 * Dashboard Layout Component
 * Main layout with sidebar navigation
 */

import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useHealthCheck } from '../../hooks/useHealthCheck';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: string;
  description: string;
}

const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Real-Time Monitor',
    icon: '📊',
    description: 'Live vibration monitoring',
  },
  {
    path: '/historical',
    label: 'Historical Analysis',
    icon: '📈',
    description: 'Trends and patterns',
  },
  {
    path: '/anomalies',
    label: 'Anomaly Details',
    icon: '🔍',
    description: 'Root cause analysis',
  },
  {
    path: '/system',
    label: 'System Performance',
    icon: '⚙️',
    description: 'Model metrics & health',
  },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const { data: health } = useHealthCheck();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex-shrink-0">
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
            <div className="text-xs text-gray-500 border-l border-slate-600 pl-3">
              v1.0.0
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-slate-800 border-r border-slate-700 flex-shrink-0 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    block px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.label}</div>
                      <div
                        className={`text-xs truncate ${
                          isActive ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Model Status in Sidebar */}
          {health && (
            <div className="p-4 border-t border-slate-700">
              <div className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                Model Status
              </div>
              <div className="space-y-2">
                {health.models.map((model) => (
                  <div
                    key={model.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-400 capitalize">
                      {model.name.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded ${
                        model.loaded
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {model.loaded ? '●' : '○'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
