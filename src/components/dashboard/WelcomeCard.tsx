'use client';

/**
 * Tarjeta de bienvenida personalizada para el dashboard
 * Muestra saludo, información de la pareja y balance rápido
 */

import { motion } from 'framer-motion';
import { Heart, TrendingUp, Calendar } from 'lucide-react';
import { getGreeting, formatDate } from '@/lib/utils';

interface WelcomeCardProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    coupleName?: string | null;
  };
}

export default function WelcomeCard({ user }: WelcomeCardProps) {
  const displayName = user.name || user.email.split('@')[0];
  const greeting = getGreeting();
  const today = formatDate(new Date(), 'EEEE, dd \'de\' MMMM');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 text-white overflow-hidden relative"
    >
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20" />
        <div className="absolute bottom-8 left-8 w-20 h-20 rounded-full bg-white/10" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-white/5" />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          {/* Saludo principal */}
          <div className="mb-4 sm:mb-0">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-5 h-5 text-pink-200" />
              <span className="text-sm font-medium text-blue-100">
                {user.coupleName || 'Budget Couple'}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              {greeting}, {displayName}
            </h1>
            
            <div className="flex items-center space-x-2 text-blue-100">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{today}</span>
            </div>
          </div>

          {/* Resumen rápido */}
          <div className="flex flex-col sm:items-end space-y-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-300" />
              <span className="text-sm text-blue-100">Balance actual</span>
            </div>
            
            {/* Placeholder - se actualizará con datos reales */}
            <div className="text-2xl font-bold">
              €0,00
            </div>
            
            <span className="text-sm text-blue-200">
              Actualizado hace un momento
            </span>
          </div>
        </div>

        {/* Barra de progreso del mes (placeholder) */}
        <div className="mt-6 pt-4 border-t border-blue-400/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-blue-100">Progreso del mes</span>
            <span className="text-sm font-medium">75%</span>
          </div>
          
          <div className="w-full bg-blue-400/30 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-white rounded-full h-2"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
} 