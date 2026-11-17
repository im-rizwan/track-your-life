import http from 'http';
import { createApp } from './app';
import { config } from './core/config/env.config';
import { logger } from './core/utils/logger';
import { connectDatabase, disconnectDatabase } from './core/database/prisma.client';

const app = createApp();
const server = http.createServer(app);

// Track active connections for graceful drain
let isShuttingDown = false;
const connections = new Set<import('net').Socket>();

server.on('connection', (conn) => {
  connections.add(conn);
  conn.on('close', () => connections.delete(conn));
});

const startServer = async (): Promise<void> => {
  try {
    // Connect to database first
    await connectDatabase();

    // Configure keep-alive timeout
    server.keepAliveTimeout = 65000; // slightly above common LB idle timeouts (60s)
    server.headersTimeout = 66000;

    // Start HTTP server
    server.listen(config.port, () => {
      logger.info(`🚀 Server running in ${config.env} mode on port ${config.port}`);
      logger.info(`📚 API Documentation: http://localhost:${config.port}/api-docs`);
      logger.info(`🏥 Health Check: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  logger.info(`${signal} received, starting graceful shutdown`);

  // Stop accepting new connections, wait for in-flight requests
  server.close(async () => {
    logger.info('HTTP server closed, all connections drained');

    try {
      // Disconnect database
      await disconnectDatabase();
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error });
      process.exit(1);
    }
  });

  // After 10s drain period, destroy remaining idle connections
  setTimeout(() => {
    logger.info(`Closing ${connections.size} remaining connections after drain period`);
    for (const conn of connections) {
      conn.destroy();
    }
  }, 10000);

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle termination signals
process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection', { reason });
  void gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  void gracefulShutdown('uncaughtException');
});

void startServer();
