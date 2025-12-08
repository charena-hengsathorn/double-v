/**
 * API client tests
 */
import { strapiApi, predictiveApi } from '@/lib/api';

// Mock axios
jest.mock('axios', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('API Clients', () => {
  describe('Strapi API', () => {
    it('should have getClients method', () => {
      expect(typeof strapiApi.getClients).toBe('function');
    });

    it('should have getPipelineDeals method', () => {
      expect(typeof strapiApi.getPipelineDeals).toBe('function');
    });

    it('should have getForecastSnapshots method', () => {
      expect(typeof strapiApi.getForecastSnapshots).toBe('function');
    });

    it('should have getBillings method', () => {
      expect(typeof strapiApi.getBillings).toBe('function');
    });

    it('should have getRiskFlags method', () => {
      expect(typeof strapiApi.getRiskFlags).toBe('function');
    });
  });

  describe('Predictive Service API', () => {
    it('should have getHealth method', () => {
      expect(typeof predictiveApi.getHealth).toBe('function');
    });

    it('should have getBaseForecast method', () => {
      expect(typeof predictiveApi.getBaseForecast).toBe('function');
    });

    it('should have getScenarioForecast method', () => {
      expect(typeof predictiveApi.getScenarioForecast).toBe('function');
    });

    it('should have getRiskHeatmap method', () => {
      expect(typeof predictiveApi.getRiskHeatmap).toBe('function');
    });

    it('should have getForecastWaterfall method', () => {
      expect(typeof predictiveApi.getForecastWaterfall).toBe('function');
    });

    it('should have runMonteCarloSimulation method', () => {
      expect(typeof predictiveApi.runMonteCarloSimulation).toBe('function');
    });
  });
});



