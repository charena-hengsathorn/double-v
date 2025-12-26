/**
 * Example: Updated Frontend API Client
 * 
 * This shows how to update your frontend /lib/api.ts to use the new Node.js API server
 * 
 * Replace the base URLs with the API server URL:
 */

// OLD - Direct calls
// const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337/api';
// const PREDICTIVE_SERVICE_URL = process.env.NEXT_PUBLIC_PREDICTIVE_SERVICE_URL || 'http://localhost:8000/api/v1';

// NEW - Use API Server
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

// Updated Strapi API client
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

  // ... other methods use /api/v1/strapi/ prefix
};

// Updated Predictive Service API client
export const predictiveApi = {
  async getBaseForecast(startMonth?: string, endMonth?: string, currency: string = 'THB') {
    const params = new URLSearchParams();
    if (startMonth) params.append('start_month', startMonth);
    if (endMonth) params.append('end_month', endMonth);
    params.append('currency', currency);
    const response = await apiClient.get(`/api/v1/predictive/models/forecast/base?${params.toString()}`);
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

  // ... other methods use /api/v1/predictive/ prefix
};


