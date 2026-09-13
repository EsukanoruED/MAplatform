import { PrismaClient } from '@prisma/client';
import { env } from '../env';

/**
 * Prisma client singleton. `tsx watch` re-evaluates modules on every change, so the
 * instance is cached on `globalThis` in development to avoid exhausting the
 * database's connection pool.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDevelopment ? ['warn', 'error'] : ['error'],
  });

if (!env.isProduction) globalForPrisma.prisma = prisma;
