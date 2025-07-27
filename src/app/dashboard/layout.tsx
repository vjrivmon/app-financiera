/**
 * Layout principal del dashboard para la aplicación financiera
 * Diseño mobile-first inspirado en Budget app con navegación adaptativa
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardNavigation from '@/components/dashboard/DashboardNavigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import FloatingChatButton from '@/components/dashboard/FloatingChatButton';

/**
 * Metadatos específicos para el dashboard
 */
export const metadata = {
  title: 'Dashboard',
  description: 'Panel principal de gestión financiera para parejas',
};

/**
 * Layout del dashboard con navegación y autenticación
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del dashboard */}
      <DashboardHeader user={session.user} />
      
      {/* Navegación lateral */}
      <DashboardNavigation />
      
      {/* Contenido principal */}
      <div className="lg:ml-64 pt-16">
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Botón flotante del chat */}
      <FloatingChatButton />
    </div>
  );
} 