import { Router, Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import axios from 'axios';

const router = Router();

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

/**
 * Proxy middleware for all Strapi endpoints
 * Routes /api/v1/strapi/* to Strapi /api/*
 */
const strapiProxy = createProxyMiddleware({
  target: STRAPI_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/strapi': '/api', // Remove /api/v1/strapi prefix
  },
  onProxyReq: (proxyReq, req: Request) => {
    // Forward authorization header if present
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
    
    // Forward request ID for tracing
    if (req.requestId) {
      proxyReq.setHeader('X-Request-ID', req.requestId);
    }

    // Log proxied request
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${req.requestId}] Proxying to Strapi: ${req.method} ${req.path}`);
    }
  },
  onProxyRes: (proxyRes, req: Request) => {
    // Add CORS headers if needed
    proxyRes.headers['X-Proxy-Service'] = 'double-v-api-server';
    proxyRes.headers['X-Request-ID'] = req.requestId || 'unknown';
  },
  onError: (err, req: Request, res: Response) => {
    console.error(`[${req.requestId}] Strapi proxy error:`, err.message);
    res.status(502).json({
      error: {
        status: 502,
        message: 'Bad Gateway - Strapi service unavailable',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
    });
  },
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
});

// Apply proxy to all Strapi routes
router.use('/*', strapiProxy);

export default router;

