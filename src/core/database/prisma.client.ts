import { PrismaClient } from '@prisma/client';
import { config } from '../config/env.config';

// Prevent multiple instances in development (hot reloading)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: config.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'minimal',
  });

if (config.isDevelopment) {
  globalForPrisma.prisma = prisma;
}

// Connection lifecycle
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log('🔌 Database disconnected');
};
