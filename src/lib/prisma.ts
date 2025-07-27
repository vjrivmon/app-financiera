import { PrismaClient } from '@prisma/client';

/**
 * Instancia global de Prisma Client optimizada para Next.js
 * Evita múltiples conexiones en desarrollo con hot reload
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Cliente de Prisma con configuración optimizada para aplicaciones financieras
 * Incluye logging detallado en desarrollo y configuraciones de performance
 */
export const prisma = globalForPrisma.prisma ?? 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    
    // Configuración optimizada para aplicaciones financieras
    datasources: {
      db: {
        url: process.env.DATABASE_URL!,
      },
    },

    // Configuraciones adicionales para performance
    errorFormat: 'pretty',
  });

// Evitar múltiples instancias en desarrollo
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Middleware para auditoría y logging de operaciones críticas
 * Registra todas las operaciones financieras para compliance
 */
prisma.$use(async (params, next) => {
  const before = Date.now();
  
  const result = await next(params);
  
  const after = Date.now();
  
  // Log de operaciones críticas en producción
  if (process.env.NODE_ENV === 'production' && 
      ['Transaction', 'Budget', 'SavingsGoal'].includes(params.model || '')) {
    console.log(`⚡ ${params.model?.toUpperCase()} ${params.action} - ${after - before}ms`);
  }
  
  return result;
});

/**
 * Hook de cierre graceful para conexiones de base de datos
 */
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;

/**
 * Función helper para manejar errores de Prisma de forma consistente
 * Útil para logging y debugging en aplicaciones financieras
 */
export function isPrismaError(error: unknown): error is Error {
  return error instanceof Error && 'code' in error;
}

/**
 * Función para desconectar Prisma Client de forma segura
 * Útil para testing y cleanup de recursos
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Función para verificar la conexión con la base de datos
 * Útil para health checks en producción
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
} 