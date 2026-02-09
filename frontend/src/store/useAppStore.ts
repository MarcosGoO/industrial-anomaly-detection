/**
 * Global state management with Zustand
 */

import { create } from 'zustand';
import type { AnomalyPrediction, HealthResponse } from '../types';

interface AppState {
  // System status
  isConnected: boolean;
  systemHealth: HealthResponse | null;

  // Predictions
  currentPrediction: AnomalyPrediction | null;
  predictionHistory: AnomalyPrediction[];

  // UI state
  isDarkMode: boolean;
  selectedView: 'realtime' | 'historical' | 'anomaly' | 'metrics';
  sidebarCollapsed: boolean;

  // Notifications
  notifications: Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: number;
  }>;

  // Actions
  setConnected: (connected: boolean) => void;
  setSystemHealth: (health: HealthResponse | null) => void;
  setCurrentPrediction: (prediction: AnomalyPrediction | null) => void;
  addToHistory: (prediction: AnomalyPrediction) => void;
  clearHistory: () => void;
  toggleDarkMode: () => void;
  setSelectedView: (view: AppState['selectedView']) => void;
  toggleSidebar: () => void;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  isConnected: false,
  systemHealth: null,
  currentPrediction: null,
  predictionHistory: [],
  isDarkMode: true,
  selectedView: 'realtime',
  sidebarCollapsed: false,
  notifications: [],

  // Actions
  setConnected: (connected) => set({ isConnected: connected }),
  setSystemHealth: (health) => set({ systemHealth: health }),
  setCurrentPrediction: (prediction) => set({ currentPrediction: prediction }),
  addToHistory: (prediction) =>
    set((state) => ({
      predictionHistory: [prediction, ...state.predictionHistory].slice(0, 100), // Keep last 100
    })),
  clearHistory: () => set({ predictionHistory: [] }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setSelectedView: (view) => set({ selectedView: view }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: `${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
        },
        ...state.notifications,
      ].slice(0, 50), // Keep last 50 notifications
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));