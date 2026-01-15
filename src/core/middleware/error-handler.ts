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
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: config.isProduction ? 'Internal server error' : err.message,
      ...(config.isDevelopment && { stack: err.stack }),
    },
  });
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(404, `Route ${req.originalUrl} not found`));
};
