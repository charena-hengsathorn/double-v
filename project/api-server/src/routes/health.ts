import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const PREDICTIVE_SERVICE_URL = process.env.PREDICTIVE_SERVICE_URL || 'http://localhost:8000';

/**
 * GET /health
 * Basic health check
 */
router.get('/', async (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'double-v-api-server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/detailed
 * Detailed health check including backend service status
 */
router.get('/detailed', async (req: Request, res: Response) => {
  const health = {
    status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
    service: 'double-v-api-server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      strapi: { status: 'unknown' as string, responseTime: 0 },
      predictive: { status: 'unknown' as string, responseTime: 0 },
    },
  };

  // Check Strapi
  try {
    const strapiStart = Date.now();
    await axios.get(`${STRAPI_URL}/api`, { timeout: 5000 });
    health.services.strapi = {
      status: 'connected',
      responseTime: Date.now() - strapiStart,
    };
  } catch (error) {
    health.services.strapi = {
      status: 'disconnected',
      responseTime: 0,
    };
    health.status = 'degraded';
  }

  // Check Predictive Service
  try {
    const predictiveStart = Date.now();
    await axios.get(`${PREDICTIVE_SERVICE_URL}/api/v1/health`, { timeout: 5000 });
    health.services.predictive = {
      status: 'connected',
      responseTime: Date.now() - predictiveStart,
    };
  } catch (error) {
    health.services.predictive = {
      status: 'disconnected',
      responseTime: 0,
    };
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;

