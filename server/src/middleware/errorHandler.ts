import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { createApiResponse } from '../utils/response';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Don't expose error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;

  res.status(500).json(createApiResponse(false, null, {
    code: 'INTERNAL_SERVER_ERROR',
    message
  }));
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json(createApiResponse(false, null, {
    code: 'NOT_FOUND',
    message: 'Route not found'
  }));
};