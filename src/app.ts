import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { config } from './core/config/env.config';
import { errorHandler, notFoundHandler } from './core/middleware/error-handler';
import { logger } from './core/utils/logger';
import { swaggerSpec } from './core/config/swagger.config';
import apiRouter from './api/router';
import { requestDuration } from './core/middleware/request-duration';
import { requestId } from './core/middleware/request-id';

export const createApp = (): Application => {
  const app = express();
  app.set('trust proxy', 1);

  // Request ID for tracing
  app.use(requestId);

  // Enhanced security headers
  app.use(
    helmet({
      contentSecurityPolicy: config.isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              scriptSrc: ["'self'"],
              imgSrc: ["'self'", 'data:', 'https:'],
            },
          }
        : false, // Disable CSP in dev for Swagger UI
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'deny', // Prevent clickjacking
      },
      noSniff: true, // Prevent MIME sniffing
      xssFilter: true, // Enable XSS filter
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400, // 24 hours
    })
  );

  // Rate limiting (already configured)
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for health checks
    skip: (req) => req.path === '/health',
  });
  app.use('/api/', limiter);

  // Stricter rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config.env === 'test' ? 10000 : 5, // relaxed in test env
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/v1/auth/login', authLimiter);
  app.use('/api/v1/auth/register', authLimiter);

  // OTP brute-force protection (10 attempts per 15 minutes)
  const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.env === 'test' ? 10000 : 10,
    message: 'Too many OTP verification attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/v1/auth/verify-email', otpLimiter);
  app.use('/api/v1/auth/reset-password', otpLimiter);
  app.use('/api/v1/auth/delete-account/confirm', otpLimiter);
  app.use('/api/v1/users/email/confirm', otpLimiter);

  // Email sending rate limit (3 per 15 minutes per IP)
  const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.env === 'test' ? 10000 : 3,
    message: 'Too many email requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/v1/auth/resend-verification', emailLimiter);
  app.use('/api/v1/auth/forgot-password', emailLimiter);
  app.use('/api/v1/auth/resend-reset-otp', emailLimiter);
  app.use('/api/v1/users/email/request', emailLimiter);

  // Body parsing with configurable size limits
  app.use(express.json({ limit: config.bodyLimit }));
  app.use(express.urlencoded({ extended: true, limit: config.bodyLimit }));

  // Request logging (skip health checks)
  app.use((req, _res, next) => {
    if (req.path === '/health' || req.path === '/api/v1/health') {
      return next();
    }

    logger.info('Incoming request', {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next();
  });
  app.use(requestDuration);
  // Health check (root level, no rate limiting)
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Swagger documentation (disable in production if needed)
  if (config.isDevelopment || process.env.ENABLE_SWAGGER === 'true') {
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Muhasabah API Docs',
      })
    );

    app.get('/api-docs.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }

  // Mount API routes
  app.use('/api', apiRouter);

  // Error handlers (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
