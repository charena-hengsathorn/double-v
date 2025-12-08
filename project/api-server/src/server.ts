import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authMiddleware } from './middleware/auth';
import strapiRoutes from './routes/strapi';
import predictiveRoutes from './routes/predictive';
import healthRoutes from './routes/health';
import envRoutes from './routes/env';

// Load environment variables from .env.local (prioritized) or .env
dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback to .env if .env.local doesn't exist

const app = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet());

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request ID and logging
app.use(requestLogger);

// Health check (before auth)
app.use('/health', healthRoutes);
app.use('/health/env', envRoutes);

// API Routes
app.use('/api/v1/strapi', authMiddleware, strapiRoutes);
app.use('/api/v1/predictive', authMiddleware, predictiveRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Double V API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      strapi: '/api/v1/strapi',
      predictive: '/api/v1/predictive',
      health: '/health',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📍 Environment: ${NODE_ENV}`);
  console.log(`🔗 Strapi URL: ${process.env.STRAPI_URL || 'http://localhost:1337'}`);
  console.log(`🔗 Predictive Service URL: ${process.env.PREDICTIVE_SERVICE_URL || 'http://localhost:8000'}`);
  console.log(`✅ CORS enabled for: ${corsOrigins.join(', ')}`);
});

export default app;

