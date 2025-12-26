import { Router, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();

const PREDICTIVE_SERVICE_URL = process.env.PREDICTIVE_SERVICE_URL || 'http://localhost:8000';

/**
 * Proxy middleware for all Predictive Service endpoints
 * Routes /api/v1/predictive/* to Predictive Service /api/v1/*
 */
const predictiveProxy = createProxyMiddleware({
  target: PREDICTIVE_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/predictive': '/api/v1', // Replace prefix
  },
  onProxyReq: (proxyReq, req: Request) => {
    // Forward authorization header if present (though predictive service may not need it)
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
    
    // Forward request ID for tracing
    if (req.requestId) {
      proxyReq.setHeader('X-Request-ID', req.requestId);
    }

    // Log proxied request
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${req.requestId}] Proxying to Predictive Service: ${req.method} ${req.path}`);
    }
  },
  onProxyRes: (proxyRes, req: Request) => {
    // Add response headers
    proxyRes.headers['X-Proxy-Service'] = 'double-v-api-server';
    proxyRes.headers['X-Request-ID'] = req.requestId || 'unknown';
  },
  onError: (err, req: Request, res: Response) => {
    console.error(`[${req.requestId}] Predictive Service proxy error:`, err.message);
    res.status(502).json({
      error: {
        status: 502,
        message: 'Bad Gateway - Predictive Service unavailable',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
    });
  },
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
});

// Apply proxy to all Predictive Service routes
router.use('/*', predictiveProxy);

export default router;


