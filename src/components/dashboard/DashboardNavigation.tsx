'use client';

/**
 * Navegación principal del dashboard
 * Mobile-first con navegación inferior en móvil y lateral en desktop
 */

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Home,
  ArrowUpDown,
  PieChart,
  Target,
  Calendar,
  MessageCircle,
  Settings,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

/**
 * Definición de las rutas de navegación
 */
const navigationItems = [
  {
    name: 'Inicio',
    href: '/dashboard',
    icon: Home,
    description: 'Resumen financiero',
  },
  {
    name: 'Transacciones',
    href: '/dashboard/transactions',
    icon: ArrowUpDown,
    description: 'Ingresos y gastos',
  },
  {
    name: 'Análisis',
    href: '/dashboard/analytics',
    icon: PieChart,
    description: 'Gráficos y reportes',
  },
  {
    name: 'Objetivos',
    href: '/dashboard/goals',
    icon: Target,
    description: 'Metas de ahorro',
  },
  {
    name: 'Calendario',
    href: '/dashboard/calendar',
    icon: Calendar,
    description: 'Planificación financiera',
  },
  {
    name: 'Asistente IA',
    href: '/dashboard/chat',
    icon: MessageCircle,
    description: 'Chatbot financiero',
  },
];

/**
 * Rutas adicionales para desktop (sidebar)
 */
const secondaryItems = [
  {
    name: 'Configuración',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Ajustes de la aplicación',
  },
];

/**
 * Componente de navegación principal
 */
export default function DashboardNavigation() {
  const pathname = usePathname();

  /**
   * Determinar si una ruta está activa
   */
  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Navegación lateral para desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex-1 px-3 space-y-1">
            {/* Navegación principal */}
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-primary-50 text-primary-700 border border-primary-100'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 transition-colors',
                        isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-indicator"
                        className="w-2 h-2 bg-primary-600 rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Separador */}
            <div className="border-t border-gray-200 my-6" />

            {/* Navegación secundaria */}
            <nav className="space-y-1">
              {secondaryItems.map((item) => {
                const isActive = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 transition-colors',
                        isActive ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Botón de acción rápida en sidebar */}
          <div className="px-3 pb-4">
            <Link href="/dashboard/transactions/new">
              <Button
                variant="primary"
                width="full"
                leftIcon={<Plus className="w-4 h-4" />}
                className="justify-center"
              >
                Nueva Transacción
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Navegación inferior para mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 safe-bottom">
        <div className="grid grid-cols-5 h-16">
          {navigationItems.slice(0, 4).map((item) => {
            const isActive = isActiveRoute(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center space-y-1 text-xs transition-colors relative',
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary-600 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}

          {/* Botón central de acción rápida */}
          <Link
            href="/dashboard/transactions/new"
            className="flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg transform -translate-y-2">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-500 mt-1">
              Agregar
            </span>
          </Link>
        </div>
      </div>

      {/* Navegación flotante adicional para mobile */}
      <div className="lg:hidden fixed top-20 right-4 flex flex-col space-y-2 z-20">
        {/* Botón de chat IA */}
        <Link href="/dashboard/chat">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors',
              isActiveRoute('/dashboard/chat')
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            )}
          >
            <MessageCircle className="w-5 h-5" />
          </motion.div>
        </Link>

        {/* Botón de calendario */}
        <Link href="/dashboard/calendar">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors',
              isActiveRoute('/dashboard/calendar')
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            )}
          >
            <Calendar className="w-5 h-5" />
          </motion.div>
        </Link>
      </div>
    </>
  );
} 