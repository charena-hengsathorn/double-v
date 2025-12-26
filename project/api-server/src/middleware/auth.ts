import { Request, Response, NextFunction } from 'express';

/**
 * Authentication middleware
 * For now, passes through auth token from frontend to backend services
 * In production, you could add token validation, refresh logic, etc.
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  
  // If no auth header, continue (some endpoints might be public)
  // The backend services will handle auth validation
  if (!authHeader) {
    // Log for debugging but don't block
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[${req.requestId}] No authorization header found`);
    }
  }

  // Pass through to next middleware
  // The proxy will forward the Authorization header
  next();
};

/**
 * Optional: Validate JWT token format (not signature)
 */
export const validateTokenFormat = (token: string): boolean => {
  // Basic JWT format check: 3 parts separated by dots
  const parts = token.split('.');
  return parts.length === 3;
};


