import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { logger } from '../utils/logger';
import { config } from '../config/env.config';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.warn('Operational error', {
      requestId: req.requestId,
      statusCode: err.statusCode,
      message: err.message,
      code: err.code,
      path: req.path,
      method: req.method,
    });

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code || 'OPERATIONAL_ERROR',
        message: err.message,
      },
    });
    return;
  }

  // Unexpected errors
  logger.error('Unexpected error', {
    requestId: req.requestId,
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // SECURITY: Never send stack traces to the client
  // Stack traces expose internal implementation details and file paths
  // They are logged server-side for debugging but never sent to users
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: config.isProduction
        ? 'An unexpected error occurred. Please try again later.'
        : err.message,
    },
  });
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(404, `Route ${req.originalUrl} not found`));
};
