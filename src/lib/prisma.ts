import { PrismaClient } from '@prisma/client';

/**
 * Configuración global de Prisma Client para la aplicación financiera
 * Implementa el patrón singleton para optimizar las conexiones de base de datos
 * y evitar la creación múltiple de instancias durante el desarrollo
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Instancia singleton de Prisma Client
 * Configurada con logging apropiado según el entorno
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    
    // Configuraciones de conexión optimizadas para aplicaciones financieras
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    
    // Configuraciones adicionales para producción
    ...(process.env.NODE_ENV === 'production' && {
      errorFormat: 'minimal',
    }),
  });

// En desarrollo, guardamos la instancia en globalThis para evitar
// recreaciones innecesarias durante el hot reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

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