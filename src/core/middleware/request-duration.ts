import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestDuration = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Skip for health checks
  if (req.path === '/health' || req.path === '/api/v1/health') {
    return next();
  }

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel]('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
};
