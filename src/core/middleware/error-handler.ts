import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/app-error';
import { logger } from '../utils/logger';
import { config } from '../config/env.config';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // express.json() throws a SyntaxError (with a `body` property attached) when
  // the request body isn't valid JSON. This is a client error, not a server fault.
  if (err instanceof SyntaxError && 'body' in err) {
    logger.warn('Malformed JSON body', {
      requestId: req.requestId,
      path: req.path,
      method: req.method,
    });

    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Request body contains malformed JSON',
      },
    });
    return;
  }

  // Prisma unique-constraint violations (P2002) happen when two concurrent
  // requests race past an application-level existence check and both attempt
  // to insert the same unique value. This is a conflict, not a server fault —
  // covers every endpoint with a @unique field, not just the ones that remember
  // to catch it locally.
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    const target = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'field';

    logger.warn('Unique constraint conflict', {
      requestId: req.requestId,
      target,
      path: req.path,
      method: req.method,
    });

    res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: `A record with this ${target} already exists`,
      },
    });
    return;
  }

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
