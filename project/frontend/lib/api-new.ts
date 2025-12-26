/**
 * Updated API client for use with Node.js API Server
 * 
 * To use this:
 * 1. Rename this file to api.ts (backup the old one first)
 * 2. Update .env.local with NEXT_PUBLIC_API_SERVER_URL=http://localhost:4000
 * 3. The API server will proxy requests to Strapi and Predictive Service
 */

import axios from 'axios';

// Use API Server instead of direct backend URLs
const API_SERVER_URL = process.env.NEXT_PUBLIC_API_SERVER_URL || 'http://localhost:4000';

// Get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('jwt');
  }
  return null;
};

// Create axios instance with auth interceptor
const apiClient = axios.create({
  baseURL: API_SERVER_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Strapi API client (via API Server)
export const strapiApi = {
  async getClients() {
    try {
      const response = await apiClient.get('/api/v1/strapi/clients');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { data: [] };
      }
      throw error;
    }
  },

  async getPipelineDeals(filters?: Record<string, any>) {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(`filters[${key}]`, value);
        });
      }
      params.append('populate', 'project,deal_milestones,risk_flags');
      const response = await apiClient.get(`/api/v1/strapi/pipeline-deals?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { data: [] };
      }
      throw error;
    }
  },

  async getForecastSnapshots(filters?: Record<string, any>) {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(`filters[${key}]`, value);
        });
      }
      params.append('populate', 'deal');
      const response = await apiClient.get(`/api/v1/strapi/forecast-snapshots?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { data: [] };
      }
      throw error;
    }
  },

  async getBillings(filters?: Record<string, any>) {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(`filters[${key}]`, value);
        });
      }
      params.append('populate', 'deal,milestone');
      const response = await apiClient.get(`/api/v1/strapi/billings?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { data: [] };
      }
      throw error;
    }
  },

  async getRiskFlags(filters?: Record<string, any>) {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(`filters[${key}]`, value);
        });
      }
      params.append('populate', 'deal');
      const response = await apiClient.get(`/api/v1/strapi/risk-flags?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { data: [] };
      }
      throw error;
    }
  },

  async getSales(filters?: Record<string, any>) {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(`filters[${key}]`, value);
        });
      }
      const url = `/api/v1/strapi/sales${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { data: [] };
      }
      throw error;
    }
  },

  async createSales(data: any) {
    const response = await apiClient.post('/api/v1/strapi/sales', { data });
    return response.data;
  },

  async updateSales(id: string | number, data: any) {
    const response = await apiClient.put(`/api/v1/strapi/sales/${id}`, { data });
    return response.data;
  },

  async deleteSales(id: string | number) {
    const response = await apiClient.delete(`/api/v1/strapi/sales/${id}`);
    return response.data;
  },
};

// Predictive Service API client (via API Server)
export const predictiveApi = {
  async getHealth() {
    const response = await apiClient.get('/api/v1/predictive/health');
    return response.data;
  },

  async getBaseForecast(startMonth?: string, endMonth?: string, currency: string = 'THB') {
    const params = new URLSearchParams();
    if (startMonth) params.append('start_month', startMonth);
    if (endMonth) params.append('end_month', endMonth);
    params.append('currency', currency);
    const response = await apiClient.get(`/api/v1/predictive/models/forecast/base?${params.toString()}`);
    return response.data;
  },

  async getScenarioForecast(scenarioId: string, startMonth?: string, endMonth?: string, currency: string = 'THB') {
    const params = new URLSearchParams();
    if (startMonth) params.append('start_month', startMonth);
    if (endMonth) params.append('end_month', endMonth);
    params.append('currency', currency);
    const response = await apiClient.get(`/api/v1/predictive/models/forecast/scenario/${scenarioId}?${params.toString()}`);
    return response.data;
  },

  async getRiskHeatmap(groupByStage: boolean = true, groupByProbability: boolean = true, minDealValue?: number) {
    const params = new URLSearchParams();
    params.append('group_by_stage', groupByStage.toString());
    params.append('group_by_probability', groupByProbability.toString());
    if (minDealValue) params.append('min_deal_value', minDealValue.toString());
    const response = await apiClient.get(`/api/v1/predictive/models/risk/heatmap?${params.toString()}`);
    return response.data;
  },

  async getForecastWaterfall(currentSnapshotDate?: string, priorSnapshotDate?: string, groupBy: string = 'deal') {
    const params = new URLSearchParams();
    if (currentSnapshotDate) params.append('current_snapshot_date', currentSnapshotDate);
    if (priorSnapshotDate) params.append('prior_snapshot_date', priorSnapshotDate);
    params.append('group_by', groupBy);
    const response = await apiClient.get(`/api/v1/predictive/models/variance/waterfall?${params.toString()}`);
    return response.data;
  },

  async runMonteCarloSimulation(dealIds: number[], iterations: number = 10000, confidenceLevels: number[] = [0.5, 0.8, 0.95]) {
    const response = await apiClient.post('/api/v1/predictive/models/forecast/simulate', {
      deal_ids: dealIds,
      iterations,
      confidence_levels: confidenceLevels,
    });
    return response.data;
  },
};

// API Server health check
export const apiServer = {
  async getHealth() {
    const response = await apiClient.get('/health');
    return response.data;
  },

  async getDetailedHealth() {
    const response = await apiClient.get('/health/detailed');
    return response.data;
  },
};


