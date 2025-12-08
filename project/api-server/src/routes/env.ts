import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /health/env
 * Shows environment variables status (without exposing secrets)
 * Useful for debugging environment variable loading
 */
router.get('/', (req: Request, res: Response) => {
  // List of env vars to show (safe, non-sensitive)
  const safeEnvVars = [
    'PORT',
    'NODE_ENV',
    'STRAPI_URL',
    'PREDICTIVE_SERVICE_URL',
    'CORS_ORIGINS',
    'LOG_LEVEL',
    'RATE_LIMIT_WINDOW_MS',
    'RATE_LIMIT_MAX_REQUESTS',
    'TRUST_PROXY',
  ];

  // Build response with env var status
  const envStatus: Record<string, any> = {
    loaded: true,
    source: 'unknown',
    variables: {} as Record<string, any>,
    missing: [] as string[],
    warnings: [] as string[],
  };

  // Check each safe env var
  safeEnvVars.forEach((varName) => {
    const value = process.env[varName];
    if (value) {
      // Mask sensitive-looking values
      let displayValue = value;
      if (varName.includes('SECRET') || varName.includes('TOKEN') || varName.includes('PASSWORD')) {
        displayValue = '***MASKED***';
      } else if (value.length > 100) {
        displayValue = `${value.substring(0, 50)}... (truncated)`;
      }
      
      envStatus.variables[varName] = {
        set: true,
        value: displayValue,
        length: value.length,
      };
    } else {
      envStatus.variables[varName] = {
        set: false,
        value: null,
      };
      envStatus.missing.push(varName);
    }
  });

  // Check which .env file was loaded
  try {
    const fs = require('fs');
    const path = require('path');
    
    const envLocalPath = path.join(process.cwd(), '.env.local');
    const envPath = path.join(process.cwd(), '.env');
    
    if (fs.existsSync(envLocalPath)) {
      envStatus.source = '.env.local';
    } else if (fs.existsSync(envPath)) {
      envStatus.source = '.env';
    } else {
      envStatus.source = 'system/environment only';
      envStatus.warnings.push('No .env.local or .env file found');
    }
  } catch (error) {
    envStatus.warnings.push('Could not determine env file source');
  }

  // Add warnings for common issues
  if (!process.env.STRAPI_URL) {
    envStatus.warnings.push('STRAPI_URL not set - using default');
  }
  
  if (!process.env.PREDICTIVE_SERVICE_URL) {
    envStatus.warnings.push('PREDICTIVE_SERVICE_URL not set - using default');
  }

  // Check if critical vars are set
  if (envStatus.missing.length > 0) {
    envStatus.loaded = false;
  }

  res.json({
    ...envStatus,
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || 'development',
  });
});

/**
 * GET /health/env/raw
 * Shows raw environment variables (BE CAREFUL - may expose secrets!)
 * Only enabled in development mode
 */
router.get('/raw', (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Raw environment variables are not available in production',
    });
  }

  // Filter out truly sensitive variables
  const sensitivePatterns = [
    /PASSWORD/i,
    /SECRET/i,
    /TOKEN/i,
    /KEY/i,
    /PRIVATE/i,
  ];

  const envVars: Record<string, string> = {};
  
  Object.keys(process.env).forEach((key) => {
    const isSensitive = sensitivePatterns.some((pattern) => pattern.test(key));
    
    if (isSensitive) {
      envVars[key] = '***MASKED (SENSITIVE)***';
    } else {
      envVars[key] = process.env[key] || '';
    }
  });

  res.json({
    environment: process.env.NODE_ENV || 'development',
    variables: envVars,
    count: Object.keys(envVars).length,
    timestamp: new Date().toISOString(),
    warning: 'This endpoint shows environment variables. Sensitive variables are masked.',
  });
});

export default router;

