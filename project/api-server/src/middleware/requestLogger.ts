import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

// Extend Request interface to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Generate unique request ID
  req.requestId = randomUUID();
  req.startTime = Date.now();

  // Log request start
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${req.requestId}] ${req.method} ${req.path}`);
  }

  // Log response time on finish
  res.on('finish', () => {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[${req.requestId}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
      );
    }
  });

  next();
};

