/**
 * Página principal del dashboard financiero
 * Vista general con widgets clave para parejas
 */

import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Metadata } from 'next';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import BudgetOverview from '@/components/dashboard/BudgetOverview';
import SavingsGoals from '@/components/dashboard/SavingsGoals';
import QuickActions from '@/components/dashboard/QuickActions';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import LoadingWidget from '@/components/dashboard/LoadingWidget';

/**
 * Metadatos de la página principal del dashboard
 */
export const metadata: Metadata = {
  title: 'Dashboard - Budget Couple App',
  description: 'Resumen financiero y gestión de ingresos, gastos y ahorros en pareja',
};

/**
 * Página principal del dashboard
 * Layout grid responsive con widgets financieros
 */
export default async function DashboardPage() {
  // Obtener sesión para personalización
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null; // El layout maneja la redirección
  }

  return (
    <div className="space-y-6">
      {/* Tarjeta de bienvenida */}
      <WelcomeCard user={session.user} />

      {/* Grid principal de widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Resumen financiero principal */}
        <div className="lg:col-span-8">
          <Suspense fallback={<LoadingWidget title="Cargando resumen..." />}>
            <DashboardSummary userId={session.user.id} />
          </Suspense>
        </div>

        {/* Acciones rápidas */}
        <div className="lg:col-span-4">
          <QuickActions />
        </div>

        {/* Transacciones recientes */}
        <div className="lg:col-span-7">
          <Suspense fallback={<LoadingWidget title="Cargando transacciones..." />}>
            <RecentTransactions userId={session.user.id} />
          </Suspense>
        </div>

        {/* Vista general de presupuestos */}
        <div className="lg:col-span-5">
          <Suspense fallback={<LoadingWidget title="Cargando presupuestos..." />}>
            <BudgetOverview userId={session.user.id} />
          </Suspense>
        </div>

        {/* Objetivos de ahorro */}
        <div className="lg:col-span-12">
          <Suspense fallback={<LoadingWidget title="Cargando objetivos..." />}>
            <SavingsGoals userId={session.user.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 