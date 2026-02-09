/**
 * Dashboard Layout Component
 * Main layout with sidebar navigation
 */

import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useHealthCheck } from '../../hooks/useHealthCheck';
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Settings,
  Cpu,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Real-Time Monitor',
    Icon: Activity,
    description: 'Live vibration monitoring',
  },
  {
    path: '/historical',
    label: 'Historical Analysis',
    Icon: TrendingUp,
    description: 'Trends and patterns',
  },
  {
    path: '/anomalies',
    label: 'Anomaly Details',
    Icon: AlertTriangle,
    description: 'Root cause analysis',
  },
  {
    path: '/system',
    label: 'System Performance',
    Icon: Settings,
    description: 'Model metrics & health',
  },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const { data: health } = useHealthCheck();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800/50 px-6 py-4 flex-shrink-0 shadow-lg shadow-slate-900/50">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-lg shadow-primary-600/20">
              <Cpu className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-display font-semibold text-slate-100 tracking-tight">
                Industrial Anomaly Detection System
              </h1>
              <p className="text-xs font-medium text-slate-500 tracking-wide uppercase mt-0.5">
                Predictive Maintenance Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {health && (
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      health.status === 'healthy'
                        ? 'bg-green-500'
                        : health.status === 'degraded'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    } animate-pulse`}
                  ></div>
                  <span className="text-sm font-medium text-slate-300 capitalize">
                    {health.status}
                  </span>
                </div>
                <div className="w-px h-4 bg-slate-700"></div>
                <span className="text-xs font-mono text-slate-500">v1.0.0</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-72 bg-slate-900/50 backdrop-blur-sm border-r border-slate-800/50 flex-shrink-0 overflow-y-auto">
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.Icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    group block px-4 py-3.5 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? 'bg-primary-600/90 text-white shadow-lg shadow-primary-600/20'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                      strokeWidth={2}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm tracking-tight truncate">
                        {item.label}
                      </div>
                      <div
                        className={`text-xs truncate mt-0.5 ${
                          isActive ? 'text-primary-100' : 'text-slate-600 group-hover:text-slate-500'
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
            <div className="p-4 mt-4 border-t border-slate-800/50">
              <div className="label-text mb-3">Model Status</div>
              <div className="space-y-2.5">
                {health.models.map((model) => (
                  <div
                    key={model.name}
                    className="flex items-center justify-between px-3 py-2 bg-slate-800/30 rounded-md border border-slate-800/50"
                  >
                    <span className="text-xs font-medium text-slate-400 capitalize">
                      {model.name.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        model.loaded
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {model.loaded ? 'ACTIVE' : 'OFFLINE'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <div className="container mx-auto p-8 max-w-screen-2xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
