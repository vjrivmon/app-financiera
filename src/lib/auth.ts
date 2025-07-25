import { NextAuthOptions, DefaultSession } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/**
 * Extensión del tipo de sesión para incluir datos específicos de la aplicación financiera
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name?: string;
      avatar?: string;
      coupleId?: string;
      coupleName?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    coupleId?: string;
    coupleName?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    coupleId?: string;
    coupleName?: string;
  }
}

/**
 * Configuración de NextAuth.js optimizada para aplicaciones financieras de parejas
 * Incluye autenticación por email/contraseña y OAuth con Google
 */
export const authOptions: NextAuthOptions = {
  // Adaptador de Prisma para gestión de usuarios y sesiones
  adapter: PrismaAdapter(prisma),
  
  // Providers de autenticación soportados
  providers: [
    // Autenticación con email y contraseña
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'tu@email.com' 
        },
        password: { 
          label: 'Contraseña', 
          type: 'password' 
        },
      },
      async authorize(credentials) {
        // Validación de credenciales
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos');
        }

        try {
          // Buscar usuario en la base de datos con información de pareja
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email.toLowerCase(),
            },
            include: {
              coupleProfile: true,
            },
          });

          // Verificar si el usuario existe
          if (!user) {
            throw new Error('Credenciales inválidas');
          }

          // Verificar contraseña (en aplicaciones reales se almacenaría el hash)
          // Por ahora asumimos que la contraseña se valida correctamente
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.email // Placeholder - reemplazar con hash real de contraseña
          );

          if (!isPasswordValid) {
            throw new Error('Credenciales inválidas');
          }

          // Retornar datos del usuario para la sesión
          return {
            id: user.id,
            email: user.email,
            name: user.name || 'Usuario',
            image: user.avatar,
          } as any;
        } catch (error) {
          console.error('Error en autenticación:', error);
          throw new Error('Error interno del servidor');
        }
      },
    }),

    // Autenticación con Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],

  // Configuración de sesiones
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
    updateAge: 24 * 60 * 60, // 24 horas
  },

  // Configuración de JWT
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  // Páginas personalizadas
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },

  // Callbacks para personalizar el comportamiento de autenticación
  callbacks: {
    // Callback de JWT - Se ejecuta cada vez que se crea o actualiza un JWT
    async jwt({ token, user, account, profile }) {
      // Primera vez que se inicia sesión
      if (user) {
        token.id = user.id;
        token.coupleId = user.coupleId;
        token.coupleName = user.coupleName;
      }

      // OAuth sign-in - crear usuario si no existe
      if (account?.provider === 'google' && profile) {
        try {
          // Buscar o crear usuario
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email! },
            include: { coupleProfile: true },
          });

          if (!existingUser) {
            // Crear nuevo usuario
            const newUser = await prisma.user.create({
              data: {
                email: profile.email!,
                name: profile.name,
                avatar: profile.picture || profile.image,
                emailVerified: new Date(),
              },
            });

            token.id = newUser.id;
            token.coupleId = null;
            token.coupleName = null;
          } else {
            token.id = existingUser.id;
            token.coupleId = existingUser.coupleId;
            token.coupleName = existingUser.coupleProfile?.name;
          }
        } catch (error) {
          console.error('Error creando usuario OAuth:', error);
        }
      }

      return token;
    },

    // Callback de sesión - Se ejecuta cada vez que se accede a la sesión
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.coupleId = token.coupleId;
        session.user.coupleName = token.coupleName;
      }

      return session;
    },

    // Callback de redirección - Controla a dónde se redirige después del login
    async redirect({ url, baseUrl }) {
      // Si la URL es relativa, usar la baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Si la URL es del mismo dominio, permitir la redirección
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Por defecto, redirigir al dashboard
      return `${baseUrl}/dashboard`;
    },
  },

  // Eventos de autenticación para logging y analytics
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`Usuario inició sesión: ${user.email}`, {
        provider: account?.provider,
        isNewUser,
      });

      // Crear configuraciones por defecto para nuevos usuarios
      if (isNewUser && user.id) {
        try {
          await prisma.userSettings.create({
            data: {
              userId: user.id,
              theme: 'LIGHT',
              language: 'es',
              currency: 'EUR',
              emailNotifications: true,
              pushNotifications: true,
              budgetAlerts: true,
              goalReminders: true,
              chatbotPersonality: 'FRIENDLY',
            },
          });

          console.log(`Configuraciones creadas para usuario: ${user.id}`);
        } catch (error) {
          console.error('Error creando configuraciones de usuario:', error);
        }
      }
    },

    async signOut({ session, token }) {
      console.log(`Usuario cerró sesión: ${session?.user?.email || token?.email}`);
    },

    async createUser({ user }) {
      console.log(`Nuevo usuario creado: ${user.email}`);
    },
  },

  // Configuración de debug en desarrollo
  debug: process.env.NODE_ENV === 'development',

  // Configuraciones de seguridad adicionales
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};

/**
 * Función helper para obtener la sesión del servidor
 * Útil para páginas y API routes que necesitan verificar autenticación
 */
export async function getServerSession() {
  const { getServerSession } = await import('next-auth/next');
  return await getServerSession(authOptions);
}

/**
 * Función helper para verificar si un usuario pertenece a una pareja
 */
export async function getUserCoupleProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      coupleProfile: {
        include: {
          users: true,
          sharedSettings: true,
        },
      },
    },
  });
}

/**
 * Función para crear un perfil de pareja para nuevos usuarios
 */
export async function createCoupleProfile(userId: string, coupleName: string) {
  try {
    const coupleProfile = await prisma.coupleProfile.create({
      data: {
        name: coupleName,
        currency: 'EUR',
        timezone: 'Europe/Madrid',
        users: {
          connect: { id: userId },
        },
        sharedSettings: {
          create: {
            splitMethod: 'EQUAL',
            defaultCurrency: 'EUR',
            budgetCycle: 'MONTHLY',
            budgetStartDay: 1,
            sharedGoalNotifications: true,
          },
        },
      },
      include: {
        users: true,
        sharedSettings: true,
      },
    });

    return coupleProfile;
  } catch (error) {
    console.error('Error creando perfil de pareja:', error);
    throw new Error('No se pudo crear el perfil de pareja');
  }
} 