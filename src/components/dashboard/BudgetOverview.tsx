'use client';

/**
 * Widget de vista general de presupuestos
 * Muestra el estado actual de los presupuestos de la pareja
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Plus
} from 'lucide-react';
import { formatCurrency, formatPercentage, calculateProgress } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface BudgetOverviewProps {
  userId: string;
}

/**
 * Datos mock para demostración
 */
const mockBudgets = [
  {
    id: '1',
    name: 'Comida y supermercado',
    category: 'Comida',
    budgetAmount: 400,
    currentAmount: 285.42,
    period: 'MONTHLY' as const,
    color: '#ef4444',
    icon: '🍽️',
  },
  {
    id: '2',
    name: 'Entretenimiento',
    category: 'Entretenimiento',
    budgetAmount: 150,
    currentAmount: 89.99,
    period: 'MONTHLY' as const,
    color: '#8b5cf6',
    icon: '🎬',
  },
  {
    id: '3',
    name: 'Transporte',
    category: 'Transporte',
    budgetAmount: 200,
    currentAmount: 165.00,
    period: 'MONTHLY' as const,
    color: '#06b6d4',
    icon: '🚗',
  },
  {
    id: '4',
    name: 'Compras varias',
    category: 'Compras',
    budgetAmount: 100,
    currentAmount: 120.50,
    period: 'MONTHLY' as const,
    color: '#f59e0b',
    icon: '🛍️',
  },
];

export default function BudgetOverview({ userId }: BudgetOverviewProps) {
  const [budgets, setBudgets] = useState(mockBudgets);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Implementar llamada real a la API
  useEffect(() => {
    // const fetchBudgets = async () => {
    //   setIsLoading(true);
    //   try {
    //     const response = await fetch(`/api/budgets/overview?userId=${userId}`);
    //     const data = await response.json();
    //     setBudgets(data);
    //   } catch (error) {
    //     console.error('Error fetching budgets:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    // fetchBudgets();
  }, [userId]);

  // Calcular estadísticas generales
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.budgetAmount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.currentAmount, 0);
  const overallProgress = calculateProgress(totalSpent, totalBudget);

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Presupuestos
          </h2>
          <p className="text-sm text-gray-500">
            Estado actual del mes
          </p>
        </div>
        
        <Link href="/dashboard/budgets/new">
          <Button variant="ghost" size="sm" rightIcon={<Plus className="w-4 h-4" />}>
            Nuevo
          </Button>
        </Link>
      </div>

      {/* Resumen general */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-blue-900">Resumen General</h3>
          <span className={`text-sm font-semibold ${
            overallProgress > 90 ? 'text-red-600' : 
            overallProgress > 75 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {formatPercentage(overallProgress)}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-blue-700">
            <span>Gastado</span>
            <span>{formatCurrency(totalSpent)} de {formatCurrency(totalBudget)}</span>
          </div>
          
          <div className="w-full bg-blue-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(overallProgress, 100)}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className={`h-2 rounded-full ${
                overallProgress > 90 ? 'bg-red-500' : 
                overallProgress > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Lista de presupuestos */}
      <div className="space-y-3">
        {budgets.map((budget, index) => {
          const progress = calculateProgress(budget.currentAmount, budget.budgetAmount);
          const isOverBudget = budget.currentAmount > budget.budgetAmount;
          const isNearLimit = progress > 80 && !isOverBudget;
          
          return (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{budget.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{budget.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{budget.category}</span>
                      {isOverBudget && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="text-xs font-medium">Excedido</span>
                        </div>
                      )}
                      {isNearLimit && (
                        <div className="flex items-center space-x-1 text-yellow-600">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="text-xs font-medium">Cerca del límite</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-semibold ${
                    isOverBudget ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {formatCurrency(budget.currentAmount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    de {formatCurrency(budget.budgetAmount)}
                  </p>
                </div>
              </div>
              
              {/* Barra de progreso */}
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                  className={`h-1.5 rounded-full ${
                    isOverBudget ? 'bg-red-500' : 
                    isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ backgroundColor: budget.color }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer con acciones */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {budgets.filter(b => b.currentAmount > b.budgetAmount).length} presupuestos excedidos
          </div>
          <Link href="/dashboard/budgets">
            <Button variant="link" size="sm">
              Gestionar presupuestos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 