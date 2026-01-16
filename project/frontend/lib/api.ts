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
      // Use Next.js API route to proxy to Strapi
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(`filters[${key}]`, value);
        });
      }
      const url = `/api/billings${params.toString() ? `?${params.toString()}` : ''}`;
      
      // Get auth token and build headers
      const token = getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return { data: [] };
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error: any) {
      // If 404 (content type not found or no permissions), return empty data
      if (error.message?.includes('404')) {
        return { data: [] };
      }
      throw error;
    }
  },

  async createBillings(data: any) {
    // Use Next.js API route to proxy to Strapi
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch('/api/billings', {
      method: 'POST',
      headers,
      body: JSON.stringify({ data }),
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create billing');
    }
    return result;
  },

  async updateBillings(id: string | number, data: any) {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/billings/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ data }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update billing');
    }
    return result;
  },

  async deleteBillings(id: string | number) {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log(`[API] Deleting billing entry with ID: ${id}`);
    const response = await fetch(`/api/billings/${id}`, {
      method: 'DELETE',
      headers,
    });
    
    console.log(`[API] Delete response status: ${response.status}`);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        const text = await response.text().catch(() => 'Unknown error');
        errorData = { error: text || `HTTP ${response.status}: ${response.statusText}` };
      }
      console.error(`[API] Delete failed:`, errorData);
      throw new Error(errorData.error || 'Failed to delete billing');
    }
    
    // Handle both JSON and empty responses
    let result;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        // Empty response means success
        result = { success: true, message: 'Deleted successfully' };
      }
    } catch (e) {
      // If JSON parsing fails, still consider it success if status is OK
      result = { success: true, message: 'Deleted successfully' };
    }
    
    console.log(`[API] Successfully deleted billing entry ${id}`, result);
    return result;
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

  async getSales(filters?: Record<string, any>) {
    try {
      // Use Next.js API route to proxy to Strapi
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(`filters[${key}]`, value);
        });
      }
      const url = `/api/sales${params.toString() ? `?${params.toString()}` : ''}`;
      
      // Get auth token and build headers
      const token = getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Include Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        // If 404, return empty array (content type not registered yet)
        if (response.status === 404) {
          return { data: [] };
        }
        throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      // If 404 from Strapi, return empty array instead of error
      if (response.status === 404 || (data.error && data.error.status === 404)) {
        return { data: [] };
      }
      
      if (!response.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to fetch sales');
      }
      return data;
    } catch (error: any) {
      // Return empty array for 404 errors (content type not registered)
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        return { data: [] };
      }
      throw error;
    }
  },

  async createSales(data: any) {
    // Use Next.js API route to proxy to Strapi
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Include Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch('/api/sales', {
      method: 'POST',
      headers,
      body: JSON.stringify({ data }),
    });
    
    // Handle non-JSON error responses
    let result;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create sale');
    }
    return result;
  },

  async updateSales(id: string | number, data: any) {
    // Use Next.js API route to proxy to Strapi
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Include Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/sales/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ data }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update sale');
    }
    return result;
  },

  async deleteSales(id: string | number) {
    // Use Next.js API route to proxy to Strapi
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Include Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/sales/${id}`, {
      method: 'DELETE',
      headers,
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete sale');
    }
    return result;
  },

  // Branch-specific API methods
  async getConstructionSales(filters?: Record<string, any>) {
    return this.getBranchSales('construction-sales', filters);
  },

  async getConstructionBillings(filters?: Record<string, any>) {
    return this.getBranchBillings('construction-billings', filters);
  },

  async getLooseFurnitureSales(filters?: Record<string, any>) {
    return this.getBranchSales('loose-furniture-sales', filters);
  },

  async getLooseFurnitureBillings(filters?: Record<string, any>) {
    return this.getBranchBillings('loose-furniture-billings', filters);
  },

  async getInteriorDesignSales(filters?: Record<string, any>) {
    return this.getBranchSales('interior-design-sales', filters);
  },

  async getInteriorDesignBillings(filters?: Record<string, any>) {
    return this.getBranchBillings('interior-design-billings', filters);
  },

  async createConstructionSales(data: any) {
    return this.createBranchSales('construction-sales', data);
  },

  async createConstructionBillings(data: any) {
    return this.createBranchBillings('construction-billings', data);
  },

  async createLooseFurnitureSales(data: any) {
    return this.createBranchSales('loose-furniture-sales', data);
  },

  async createLooseFurnitureBillings(data: any) {
    return this.createBranchBillings('loose-furniture-billings', data);
  },

  async createInteriorDesignSales(data: any) {
    return this.createBranchSales('interior-design-sales', data);
  },

  async createInteriorDesignBillings(data: any) {
    return this.createBranchBillings('interior-design-billings', data);
  },

  async updateConstructionSales(id: string | number, data: any) {
    return this.updateBranchSales('construction-sales', id, data);
  },

  async updateConstructionBillings(id: string | number, data: any) {
    return this.updateBranchBillings('construction-billings', id, data);
  },

  async updateLooseFurnitureSales(id: string | number, data: any) {
    return this.updateBranchSales('loose-furniture-sales', id, data);
  },

  async updateLooseFurnitureBillings(id: string | number, data: any) {
    return this.updateBranchBillings('loose-furniture-billings', id, data);
  },

  async updateInteriorDesignSales(id: string | number, data: any) {
    return this.updateBranchSales('interior-design-sales', id, data);
  },

  async updateInteriorDesignBillings(id: string | number, data: any) {
    return this.updateBranchBillings('interior-design-billings', id, data);
  },

  async deleteConstructionSales(id: string | number) {
    return this.deleteBranchSales('construction-sales', id);
  },

  async deleteConstructionBillings(id: string | number) {
    return this.deleteBranchBillings('construction-billings', id);
  },

  async deleteLooseFurnitureSales(id: string | number) {
    return this.deleteBranchSales('loose-furniture-sales', id);
  },

  async deleteLooseFurnitureBillings(id: string | number) {
    return this.deleteBranchBillings('loose-furniture-billings', id);
  },

  async deleteInteriorDesignSales(id: string | number) {
    return this.deleteBranchSales('interior-design-sales', id);
  },

  async deleteInteriorDesignBillings(id: string | number) {
    return this.deleteBranchBillings('interior-design-billings', id);
  },

  // Helper methods for branch-specific operations
  async getBranchSales(endpoint: string, filters?: Record<string, any>) {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(`filters[${key}]`, value);
        });
      }
      const url = `/api/${endpoint}${params.toString() ? `?${params.toString()}` : ''}`;
      
      const token = getAuthToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) { headers['Authorization'] = `Bearer ${token}`; }
      
      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) {
        if (response.status === 404) return { data: [] };
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      if (error.message?.includes('404')) return { data: [] };
      throw error;
    }
  },

  async getBranchBillings(endpoint: string, filters?: Record<string, any>) {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(`filters[${key}]`, value);
        });
      }
      const url = `/api/${endpoint}${params.toString() ? `?${params.toString()}` : ''}`;
      
      const token = getAuthToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) { headers['Authorization'] = `Bearer ${token}`; }
      
      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) {
        if (response.status === 404) return { data: [] };
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      if (error.message?.includes('404')) return { data: [] };
      throw error;
    }
  },

  async createBranchSales(endpoint: string, data: any) {
    const token = getAuthToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) { headers['Authorization'] = `Bearer ${token}`; }
    
    const response = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ data }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to create sale');
    return result;
  },

  async createBranchBillings(endpoint: string, data: any) {
    const token = getAuthToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) { headers['Authorization'] = `Bearer ${token}`; }
    
    const response = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ data }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to create billing');
    return result;
  },

  async updateBranchSales(endpoint: string, id: string | number, data: any) {
    const token = getAuthToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) { headers['Authorization'] = `Bearer ${token}`; }
    
    const response = await fetch(`/api/${endpoint}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ data }),
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to update sale';
      try {
        const result = await response.json();
        errorMessage = result.error?.message || result.error || `HTTP ${response.status}: ${response.statusText}`;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    return result;
  },

  async updateBranchBillings(endpoint: string, id: string | number, data: any) {
    const token = getAuthToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) { headers['Authorization'] = `Bearer ${token}`; }
    
    const response = await fetch(`/api/${endpoint}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ data }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to update billing');
    return result;
  },

  async deleteBranchSales(endpoint: string, id: string | number) {
    const token = getAuthToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) { headers['Authorization'] = `Bearer ${token}`; }
    
    const response = await fetch(`/api/${endpoint}/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (response.status === 204) return { success: true };
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to delete sale');
    return result;
  },

  async deleteBranchBillings(endpoint: string, id: string | number) {
    const token = getAuthToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) { headers['Authorization'] = `Bearer ${token}`; }
    
    const response = await fetch(`/api/${endpoint}/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (response.status === 204) return { success: true };
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to delete billing');
    return result;
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

