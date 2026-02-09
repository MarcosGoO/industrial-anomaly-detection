/**
 * Predictions Hook
 * Custom hook for managing real-time prediction data
 */

import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { createDataStream } from '../services/predictionService';

interface UsePredictionsOptions {
  autoStart?: boolean;
  intervalMs?: number;
}

export function usePredictions(options: UsePredictionsOptions = {}) {
  const { autoStart = true, intervalMs = 2000 } = options;
  const cleanupRef = useRef<(() => void) | null>(null);

  const {
    currentPrediction,
    predictionHistory,
    setCurrentPrediction,
    addToHistory,
  } = useAppStore();

  useEffect(() => {
    if (!autoStart) return;

    // Start data stream
    cleanupRef.current = createDataStream((prediction) => {
      setCurrentPrediction(prediction);
      addToHistory(prediction);
    }, intervalMs);

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [autoStart, intervalMs, setCurrentPrediction, addToHistory]);

  return {
    currentPrediction,
    predictionHistory,
  };
}
