'use client';

/**
 * Widget de resumen financiero principal
 * Muestra métricas clave del mes actual con visualizaciones
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank,
  ArrowUp,
  ArrowDown,
  MoreHorizontal
} from 'lucide-react';
import { formatCurrency, formatPercentage, getCurrentMonthRange } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface DashboardSummaryProps {
  userId: string;
}

/**
 * Datos mock para demostración - se reemplazarán con datos reales de la API
 */
const mockData = {
  currentBalance: 1250.50,
  monthlyIncome: 3200.00,
  monthlyExpenses: 1949.50,
  savingsRate: 39.1,
  monthOverMonth: {
    income: 8.5,
    expenses: -12.3,
    savings: 15.2,
  },
};

export default function DashboardSummary({ userId }: DashboardSummaryProps) {
  const [data, setData] = useState(mockData);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Implementar llamada real a la API
  useEffect(() => {
    // const fetchSummary = async () => {
    //   setIsLoading(true);
    //   try {
    //     const response = await fetch(`/api/dashboard/summary?userId=${userId}`);
    //     const summaryData = await response.json();
    //     setData(summaryData);
    //   } catch (error) {
    //     console.error('Error fetching summary:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    // fetchSummary();
  }, [userId]);

  const balance = data.currentBalance;
  const netIncome = data.monthlyIncome - data.monthlyExpenses;
  const { start: monthStart } = getCurrentMonthRange();

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Resumen Financiero
          </h2>
          <p className="text-sm text-gray-500">
            {monthStart.toLocaleDateString('es-ES', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
        
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Balance actual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              Balance
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {formatCurrency(balance)}
          </p>
          <p className="text-sm text-blue-600">
            Saldo actual
          </p>
        </motion.div>

        {/* Ingresos del mes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div className="flex items-center space-x-1 text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              <ArrowUp className="w-3 h-3" />
              <span>{formatPercentage(data.monthOverMonth.income, 1)}</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(data.monthlyIncome)}
          </p>
          <p className="text-sm text-green-600">
            Ingresos este mes
          </p>
        </motion.div>

        {/* Gastos del mes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-100"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <div className="flex items-center space-x-1 text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              <ArrowDown className="w-3 h-3" />
              <span>{formatPercentage(Math.abs(data.monthOverMonth.expenses), 1)}</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-red-900">
            {formatCurrency(data.monthlyExpenses)}
          </p>
          <p className="text-sm text-red-600">
            Gastos este mes
          </p>
        </motion.div>

        {/* Tasa de ahorro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100"
        >
          <div className="flex items-center justify-between mb-2">
            <PiggyBank className="w-5 h-5 text-purple-600" />
            <div className="flex items-center space-x-1 text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              <ArrowUp className="w-3 h-3" />
              <span>{formatPercentage(data.monthOverMonth.savings, 1)}</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {formatPercentage(data.savingsRate)}
          </p>
          <p className="text-sm text-purple-600">
            Tasa de ahorro
          </p>
        </motion.div>
      </div>

      {/* Resumen de progreso */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Progreso del Mes</h3>
          <span className="text-sm text-gray-500">
            {formatCurrency(netIncome)} de ganancia neta
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Gastado</span>
            <span>
              {formatCurrency(data.monthlyExpenses)} de {formatCurrency(data.monthlyIncome)}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min((data.monthlyExpenses / data.monthlyIncome) * 100, 100)}%` 
              }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full"
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
} 