import { PrismaClient } from '@prisma/client';

// Prevent instantiating multiple PrismaClient instances in development
// due to hot module reloading causing memory issues
declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  /**
   * Prisma v7 with Neon PostgreSQL
   * When the library engine is used, the adapter is automatically
   * determined by the datasource URL protocol
   */
  let client: PrismaClient;
  
  // For serverless/edge environments, use the Neon adapter
  if (typeof globalThis !== 'undefined' && process.env.DATABASE_URL) {
    try {
      const { PrismaNeon } = require('@prisma/adapter-neon');
      const { neon } = require('@neondatabase/serverless');
      
      const sql = neon(process.env.DATABASE_URL);
      const adapter = new PrismaNeon(sql);
      
      client = new PrismaClient({
        adapter,
        log:
          process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
      });
    } catch (e) {
      // Fallback to standard client if adapter unavailable
      client = new PrismaClient({
        log:
          process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
      });
    }
  } else {
    client = new PrismaClient({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });
  }
  
  return client;
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
