/**
 * Custom hook for system health monitoring
 */

import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { useEffect } from 'react';

export function useHealthCheck(refetchInterval: number = 10000) {
  const setSystemHealth = useAppStore((state) => state.setSystemHealth);
  const setConnected = useAppStore((state) => state.setConnected);

  const query = useQuery({
    queryKey: ['health'],
    queryFn: () => apiService.getHealth(),
    refetchInterval,
    retry: 3,
  });

  useEffect(() => {
    if (query.data) {
      setSystemHealth(query.data);
      setConnected(true);
    } else if (query.error) {
      setConnected(false);
      setSystemHealth(null);
    }
  }, [query.data, query.error, setSystemHealth, setConnected]);

  return query;
}
