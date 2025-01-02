import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Neon 연결 풀 설정
const neonPool = new Pool({
  connectionString: process.env.DIRECT_URL,
  max: 10,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 2000,
});

// 연결 풀 에러 처리
neonPool.on('error', (err) => {
  if (err.message.includes('SASL')) {
    console.error('Neon SASL error detected. Resetting connection pool...');
    neonPool.end(); // 기존 연결 풀 종료
  }
});

// Prisma 클라이언트 초기화
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DIRECT_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
