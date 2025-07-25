'use client';

/**
 * Widget de acciones rápidas para el dashboard
 * Botones de acceso directo a funciones principales
 */

import { motion } from 'framer-motion';
import { 
  Plus, 
  ArrowUpDown, 
  Target, 
  PieChart, 
  Calendar,
  MessageCircle 
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Definición de acciones rápidas
 */
const quickActions = [
  {
    title: 'Nueva Transacción',
    description: 'Registrar ingreso o gasto',
    href: '/dashboard/transactions/new',
    icon: Plus,
    color: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Ver Transacciones',
    description: 'Historial completo',
    href: '/dashboard/transactions',
    icon: ArrowUpDown,
    color: 'from-green-500 to-green-600',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'Nuevo Objetivo',
    description: 'Meta de ahorro',
    href: '/dashboard/goals/new',
    icon: Target,
    color: 'from-purple-500 to-purple-600',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Ver Análisis',
    description: 'Gráficos y reportes',
    href: '/dashboard/analytics',
    icon: PieChart,
    color: 'from-orange-500 to-orange-600',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    title: 'Calendario',
    description: 'Planificar gastos',
    href: '/dashboard/calendar',
    icon: Calendar,
    color: 'from-cyan-500 to-cyan-600',
    textColor: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
  },
  {
    title: 'Asistente IA',
    description: 'Consejos financieros',
    href: '/dashboard/chat',
    icon: MessageCircle,
    color: 'from-pink-500 to-pink-600',
    textColor: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
];

export default function QuickActions() {
  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Acciones Rápidas
        </h2>
        <span className="text-sm text-gray-500">
          Accesos directos
        </span>
      </div>

      {/* Grid de acciones */}
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={action.href}>
                <div className={cn(
                  'p-4 rounded-xl border-2 border-transparent transition-all duration-200',
                  'hover:border-gray-200 hover:shadow-md hover:-translate-y-1',
                  action.bgColor
                )}>
                  {/* Icono */}
                  <div className={cn(
                    'w-10 h-10 rounded-xl mb-3 flex items-center justify-center',
                    `bg-gradient-to-r ${action.color}`
                  )}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Contenido */}
                  <h3 className={cn(
                    'font-medium text-sm mb-1',
                    action.textColor
                  )}>
                    {action.title}
                  </h3>
                  
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Footer con tip */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          💡 <strong>Tip:</strong> Usa el botón + para agregar transacciones rápidamente
        </p>
      </div>
    </div>
  );
} 