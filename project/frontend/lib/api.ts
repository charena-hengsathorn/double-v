/**
 * API client for Strapi and Predictive Service
 */
import axios from 'axios';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337/api';
const PREDICTIVE_SERVICE_URL = process.env.NEXT_PUBLIC_PREDICTIVE_SERVICE_URL || 'http://localhost:8000/api/v1';

// Get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('jwt');
  }
  return null;
};

// Create axios instance with auth interceptor
const strapiClient = axios.create({
  baseURL: STRAPI_URL,
});

strapiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Strapi API client
export const strapiApi = {
  async getClients() {
    try {
      const response = await strapiClient.get('/clients');
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
      const response = await strapiClient.get(`/pipeline-deals?${params.toString()}`);
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
      const response = await strapiClient.get(`/forecast-snapshots?${params.toString()}`);
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
      const response = await strapiClient.get(`/billings?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      // If 404 (content type not found or no permissions), return empty data
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
      const response = await strapiClient.get(`/risk-flags?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { data: [] };
      }
      throw error;
    }
  },
};

// Predictive Service API client
export const predictiveApi = {
  async getHealth() {
    const response = await axios.get(`${PREDICTIVE_SERVICE_URL}/health`);
    return response.data;
  },

  async getBaseForecast(startMonth?: string, endMonth?: string, currency: string = 'THB') {
    const params = new URLSearchParams();
    if (startMonth) params.append('start_month', startMonth);
    if (endMonth) params.append('end_month', endMonth);
    params.append('currency', currency);
    const response = await axios.get(`${PREDICTIVE_SERVICE_URL}/models/forecast/base?${params.toString()}`);
    return response.data;
  },

  async getScenarioForecast(scenarioId: string, startMonth?: string, endMonth?: string, currency: string = 'THB') {
    const params = new URLSearchParams();
    if (startMonth) params.append('start_month', startMonth);
    if (endMonth) params.append('end_month', endMonth);
    params.append('currency', currency);
    const response = await axios.get(`${PREDICTIVE_SERVICE_URL}/models/forecast/scenario/${scenarioId}?${params.toString()}`);
    return response.data;
  },

  async getRiskHeatmap(groupByStage: boolean = true, groupByProbability: boolean = true, minDealValue?: number) {
    const params = new URLSearchParams();
    params.append('group_by_stage', groupByStage.toString());
    params.append('group_by_probability', groupByProbability.toString());
    if (minDealValue) params.append('min_deal_value', minDealValue.toString());
    const response = await axios.get(`${PREDICTIVE_SERVICE_URL}/models/risk/heatmap?${params.toString()}`);
    return response.data;
  },

  async getForecastWaterfall(currentSnapshotDate?: string, priorSnapshotDate?: string, groupBy: string = 'deal') {
    const params = new URLSearchParams();
    if (currentSnapshotDate) params.append('current_snapshot_date', currentSnapshotDate);
    if (priorSnapshotDate) params.append('prior_snapshot_date', priorSnapshotDate);
    params.append('group_by', groupBy);
    const response = await axios.get(`${PREDICTIVE_SERVICE_URL}/models/variance/waterfall?${params.toString()}`);
    return response.data;
  },

  async runMonteCarloSimulation(dealIds: number[], iterations: number = 10000, confidenceLevels: number[] = [0.5, 0.8, 0.95]) {
    const response = await axios.post(`${PREDICTIVE_SERVICE_URL}/models/forecast/simulate`, {
      deal_ids: dealIds,
      iterations,
      confidence_levels: confidenceLevels,
    });
    return response.data;
  },
};

