'use client';

/**
 * Widget de transacciones recientes
 * Muestra las últimas operaciones financieras de la pareja
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  MoreHorizontal,
  Eye
} from 'lucide-react';
import { formatCurrency, formatRelativeDate, getCategoryEmoji } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface RecentTransactionsProps {
  userId: string;
}

/**
 * Datos mock para demostración
 */
const mockTransactions = [
  {
    id: '1',
    description: 'Supermercado Mercadona',
    amount: -85.42,
    type: 'EXPENSE' as const,
    category: 'Comida',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
    user: 'María',
  },
  {
    id: '2',
    description: 'Nómina de diciembre',
    amount: 2400.00,
    type: 'INCOME' as const,
    category: 'Nómina',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás
    user: 'Carlos',
  },
  {
    id: '3',
    description: 'Netflix suscripción',
    amount: -12.99,
    type: 'EXPENSE' as const,
    category: 'Entretenimiento',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 días atrás
    user: 'María',
  },
  {
    id: '4',
    description: 'Gasolina',
    amount: -65.00,
    type: 'EXPENSE' as const,
    category: 'Transporte',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 días atrás
    user: 'Carlos',
  },
  {
    id: '5',
    description: 'Freelance proyecto web',
    amount: 450.00,
    type: 'INCOME' as const,
    category: 'Freelance',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 días atrás
    user: 'María',
  },
];

export default function RecentTransactions({ userId }: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Implementar llamada real a la API
  useEffect(() => {
    // const fetchTransactions = async () => {
    //   setIsLoading(true);
    //   try {
    //     const response = await fetch(`/api/transactions/recent?userId=${userId}`);
    //     const data = await response.json();
    //     setTransactions(data);
    //   } catch (error) {
    //     console.error('Error fetching transactions:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    // fetchTransactions();
  }, [userId]);

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Transacciones Recientes
          </h2>
          <p className="text-sm text-gray-500">
            Últimos movimientos
          </p>
        </div>
        
        <Link href="/dashboard/transactions">
          <Button variant="ghost" size="sm" rightIcon={<Eye className="w-4 h-4" />}>
            Ver todas
          </Button>
        </Link>
      </div>

      {/* Lista de transacciones */}
      <div className="space-y-3">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {/* Icono y detalles */}
            <div className="flex items-center space-x-3">
              {/* Icono de categoría */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-lg
                ${transaction.type === 'INCOME' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
                }
              `}>
                {getCategoryEmoji(transaction.category)}
              </div>

              {/* Información de la transacción */}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">
                  {transaction.description}
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{transaction.category}</span>
                  <span>•</span>
                  <span>{transaction.user}</span>
                  <span>•</span>
                  <span>{formatRelativeDate(transaction.date)}</span>
                </div>
              </div>
            </div>

            {/* Cantidad e indicador */}
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'INCOME' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {transaction.type === 'INCOME' ? '+' : ''}
                  {formatCurrency(Math.abs(transaction.amount))}
                </p>
              </div>
              
              {/* Icono de dirección */}
              {transaction.type === 'INCOME' ? (
                <ArrowUp className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-500" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer con resumen */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {transactions.length} transacciones esta semana
          </span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-green-600">
              <ArrowUp className="w-3 h-3" />
              <span className="font-medium">
                +{formatCurrency(
                  transactions
                    .filter(t => t.type === 'INCOME')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-red-600">
              <ArrowDown className="w-3 h-3" />
              <span className="font-medium">
                {formatCurrency(
                  Math.abs(transactions
                    .filter(t => t.type === 'EXPENSE')
                    .reduce((sum, t) => sum + t.amount, 0))
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 