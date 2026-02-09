/**
 * API service for communicating with the backend
 */

import axios, { type AxiosInstance } from 'axios';
import type {
  PredictionRequest,
  PredictionResponse,
  HealthResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });
  }

  /**
   * Make anomaly prediction on feature data
   */
  async predict(request: PredictionRequest): Promise<PredictionResponse> {
    const response = await this.client.post<PredictionResponse>(
      '/api/predict',
      request
    );
    return response.data;
  }

  /**
   * Get system health status
   */
  async getHealth(): Promise<HealthResponse> {
    const response = await this.client.get<HealthResponse>('/api/health');
    return response.data;
  }

  /**
   * Check if service is ready
   */
  async checkReady(): Promise<boolean> {
    try {
      const response = await this.client.get<{ ready: boolean }>(
        '/api/ready'
      );
      return response.data.ready;
    } catch {
      return false;
    }
  }

  /**
   * Get API root information
   */
  async getInfo(): Promise<{
    name: string;
    version: string;
    status: string;
  }> {
    const response = await this.client.get('/');
    return response.data;
  }

  /**
   * Generic POST request
   */
  async post<T>(url: string, data: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  /**
   * Generic GET request
   */
  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }
}

export const apiService = new ApiService();
export const api = apiService; // Export as 'api' for convenience
