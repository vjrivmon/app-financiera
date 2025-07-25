/**
 * Layout principal del dashboard para la aplicación financiera
 * Diseño mobile-first inspirado en Budget app con navegación adaptativa
 */

import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import DashboardNavigation from '@/components/dashboard/DashboardNavigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Metadata } from 'next';

/**
 * Metadatos específicos para el dashboard
 */
export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Panel principal de gestión financiera para parejas',
};

/**
 * Layout del dashboard con autenticación requerida
 * Incluye navegación responsive y header personalizado
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar autenticación en el servidor
  const session = await getServerSession(authOptions);

  // Redirigir a login si no está autenticado
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fijo en la parte superior */}
      <DashboardHeader user={session.user} />
      
      {/* Container principal con navegación y contenido */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Navegación lateral (desktop) / inferior (mobile) */}
        <DashboardNavigation />
        
        {/* Área de contenido principal */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 pb-20 sm:pb-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 