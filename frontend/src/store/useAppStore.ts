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

  // Actions
  setConnected: (connected: boolean) => void;
  setSystemHealth: (health: HealthResponse | null) => void;
  setCurrentPrediction: (prediction: AnomalyPrediction | null) => void;
  addToHistory: (prediction: AnomalyPrediction) => void;
  clearHistory: () => void;
  toggleDarkMode: () => void;
  setSelectedView: (view: AppState['selectedView']) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  isConnected: false,
  systemHealth: null,
  currentPrediction: null,
  predictionHistory: [],
  isDarkMode: true,
  selectedView: 'realtime',

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
}));