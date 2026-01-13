import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  status?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log error details
  console.error('API Error:', {
    statusCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    error: {
      status: statusCode,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};



