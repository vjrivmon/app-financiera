import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * API Route handler para NextAuth.js
 * Maneja todas las rutas de autenticación: /api/auth/*
 * 
 * Soporta:
 * - GET /api/auth/signin - Página de inicio de sesión
 * - POST /api/auth/signin - Procesar inicio de sesión
 * - GET /api/auth/signout - Cerrar sesión
 * - GET /api/auth/session - Obtener sesión actual
 * - GET /api/auth/csrf - Token CSRF
 * - GET /api/auth/providers - Proveedores disponibles
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 