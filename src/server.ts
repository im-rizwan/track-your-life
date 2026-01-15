import http from 'http';
import { createApp } from './app';
import { config } from './core/config/env.config';
import { logger } from './core/utils/logger';
import { connectDatabase, disconnectDatabase } from './core/database/prisma.client';

const app = createApp();
const server = http.createServer(app);

const startServer = async (): Promise<void> => {
  try {
    // Connect to database first
    await connectDatabase();
    
    // Start HTTP server
    server.listen(config.port, () => {
      logger.info(`🚀 Server running in ${config.env} mode on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received, starting graceful shutdown`);

  server.close(async () => {
    logger.info('HTTP server closed');
    
    // Disconnect database
    await disconnectDatabase();
    
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection', { reason });
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

void startServer();
