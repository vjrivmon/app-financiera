'use client';

/**
 * Widget de objetivos de ahorro
 * Muestra el progreso de las metas financieras de la pareja
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  Calendar,
  Heart,
  Plus,
  Trophy
} from 'lucide-react';
import { formatCurrency, formatDate, calculateProgress, getDaysUntil } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface SavingsGoalsProps {
  userId: string;
}

/**
 * Datos mock para demostración
 */
const mockGoals = [
  {
    id: '1',
    name: 'Viaje a Japón 2024',
    description: 'Luna de miel en Tokio y Kioto',
    targetAmount: 4500,
    currentAmount: 1850,
    targetDate: new Date('2024-09-15'),
    priority: 'HIGH' as const,
    icon: '✈️',
    color: '#3b82f6',
  },
  {
    id: '2',
    name: 'Coche nuevo',
    description: 'Reemplazar el actual',
    targetAmount: 8000,
    currentAmount: 2400,
    targetDate: new Date('2024-12-31'),
    priority: 'MEDIUM' as const,
    icon: '🚗',
    color: '#10b981',
  },
  {
    id: '3',
    name: 'Fondo de emergencia',
    description: 'Equivalente a 6 meses de gastos',
    targetAmount: 12000,
    currentAmount: 7200,
    targetDate: new Date('2025-06-30'),
    priority: 'HIGH' as const,
    icon: '🛡️',
    color: '#f59e0b',
  },
  {
    id: '4',
    name: 'Renovación apartamento',
    description: 'Cocina y baño nuevos',
    targetAmount: 6000,
    currentAmount: 950,
    targetDate: new Date('2025-03-31'),
    priority: 'LOW' as const,
    icon: '🏠',
    color: '#8b5cf6',
  },
];

export default function SavingsGoals({ userId }: SavingsGoalsProps) {
  const [goals, setGoals] = useState(mockGoals);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Implementar llamada real a la API
  useEffect(() => {
    // const fetchGoals = async () => {
    //   setIsLoading(true);
    //   try {
    //     const response = await fetch(`/api/savings-goals?userId=${userId}`);
    //     const data = await response.json();
    //     setGoals(data);
    //   } catch (error) {
    //     console.error('Error fetching goals:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    // fetchGoals();
  }, [userId]);

  // Calcular estadísticas generales
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = calculateProgress(totalSaved, totalTarget);
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Objetivos de Ahorro
          </h2>
          <p className="text-sm text-gray-500">
            Metas financieras de la pareja
          </p>
        </div>
        
        <Link href="/dashboard/goals/new">
          <Button variant="ghost" size="sm" rightIcon={<Plus className="w-4 h-4" />}>
            Nuevo objetivo
          </Button>
        </Link>
      </div>

      {/* Resumen general */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-pink-500" />
            <h3 className="font-medium text-purple-900">Progreso Total</h3>
          </div>
          <div className="flex items-center space-x-2">
            {completedGoals > 0 && (
              <div className="flex items-center space-x-1 text-green-600">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-medium">{completedGoals} completados</span>
              </div>
            )}
            <span className="text-lg font-bold text-purple-900">
              {overallProgress.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-purple-700">
            <span>Ahorrado</span>
            <span>{formatCurrency(totalSaved)} de {formatCurrency(totalTarget)}</span>
          </div>
          
          <div className="w-full bg-purple-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(overallProgress, 100)}%` }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Grid de objetivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal, index) => {
          const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
          const isCompleted = goal.currentAmount >= goal.targetAmount;
          const daysUntil = getDaysUntil(goal.targetDate);
          const isOverdue = daysUntil < 0;
          
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                isCompleted 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Header del objetivo */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{goal.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {goal.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {goal.description}
                    </p>
                  </div>
                </div>
                
                {isCompleted && (
                  <Trophy className="w-4 h-4 text-green-500" />
                )}
              </div>

              {/* Progreso */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Progreso</span>
                  <span className="text-xs font-medium text-gray-700">
                    {progress.toFixed(1)}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                    className="h-2 rounded-full"
                    style={{ backgroundColor: goal.color }}
                  />
                </div>
              </div>

              {/* Información financiera */}
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ahorrado:</span>
                  <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Objetivo:</span>
                  <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Restante:</span>
                  <span className={`font-medium ${
                    isCompleted ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {isCompleted 
                      ? '¡Completado!' 
                      : formatCurrency(goal.targetAmount - goal.currentAmount)
                    }
                  </span>
                </div>
              </div>

              {/* Fecha objetivo */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span className="text-gray-500">
                    {formatDate(goal.targetDate, 'dd MMM yyyy')}
                  </span>
                </div>
                
                <span className={`font-medium ${
                  isCompleted ? 'text-green-600' : 
                  isOverdue ? 'text-red-600' : 
                  daysUntil < 30 ? 'text-yellow-600' : 'text-gray-600'
                }`}>
                  {isCompleted ? '¡Logrado!' :
                   isOverdue ? `${Math.abs(daysUntil)} días tarde` :
                   daysUntil === 0 ? 'Hoy' :
                   `${daysUntil} días restantes`
                  }
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer con acciones */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {goals.length} objetivos activos • {formatCurrency(totalTarget - totalSaved)} por ahorrar
          </div>
          <Link href="/dashboard/goals">
            <Button variant="link" size="sm">
              Ver todos los objetivos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 