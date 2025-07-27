'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SavingsGoal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  priority: string;
}

/**
 * Página para añadir dinero a un objetivo específico
 */
export default function AddMoneyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    // Simulamos obtener el objetivo (en una implementación real sería desde la API)
    // Por ahora usamos datos estáticos basados en el ID
    const mockGoal: SavingsGoal = {
      id: params.id,
      name: 'Prueba',
      description: 'prueba',
      targetAmount: 300,
      currentAmount: 250,
      targetDate: '2025-07-31',
      priority: 'HIGH'
    };
    setGoal(mockGoal);
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Por favor, introduce una cantidad válida');
      return;
    }

    setLoading(true);

    try {
      // Simular llamada a API para añadir dinero
      console.log(`💰 Añadiendo €${amount} al objetivo ${goal?.name}`);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`✅ €${amount} añadido correctamente al objetivo "${goal?.name}"`);
      
      // Redirigir de vuelta a la lista de objetivos
      router.push('/dashboard/goals');
      
    } catch (error) {
      console.error('❌ Error añadiendo dinero:', error);
      alert('Error al añadir dinero. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!goal) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando objetivo...</p>
        </div>
      </div>
    );
  }

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remainingAmount = goal.targetAmount - goal.currentAmount;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
          <Link href="/dashboard/goals" className="hover:text-blue-600 transition-colors">
            Objetivos
          </Link>
          <span>→</span>
          <span className="text-gray-900">{goal.name}</span>
          <span>→</span>
          <span className="text-gray-900">Añadir Dinero</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Añadir Dinero</h1>
        <p className="text-gray-600 mt-2">Incrementa tu progreso hacia "{goal.name}"</p>
      </div>

      {/* Goal Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{goal.name}</h3>
            {goal.description && (
              <p className="text-gray-600 text-sm">{goal.description}</p>
            )}
          </div>
          <span className={`px-2 py-1 text-xs rounded-full shrink-0 ml-2 ${
            goal.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
            goal.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            Prioridad {goal.priority === 'HIGH' ? 'Alta' : goal.priority === 'MEDIUM' ? 'Media' : 'Baja'}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>€{goal.currentAmount.toFixed(2)}</span>
            <span>€{goal.targetAmount.toFixed(2)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm font-medium text-gray-900">
              {progress.toFixed(1)}% completado
            </span>
            <span className="text-sm text-gray-500">
              Faltan €{remainingAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {goal.targetDate && (
          <p className="text-sm text-gray-500">
            📅 Fecha objetivo: {new Date(goal.targetDate).toLocaleDateString('es-ES')}
          </p>
        )}
      </div>

      {/* Add Money Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">¿Cuánto quieres añadir?</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad a añadir *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">€</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0.01"
                max={remainingAmount}
                placeholder="0,00"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Máximo: €{remainingAmount.toFixed(2)} (para completar el objetivo)
            </p>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidades rápidas
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map(quickAmount => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  disabled={quickAmount > remainingAmount}
                >
                  €{quickAmount}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Vista previa</h3>
              <div className="text-sm text-blue-800">
                <p>• Cantidad actual: €{goal.currentAmount.toFixed(2)}</p>
                <p>• Cantidad a añadir: €{parseFloat(amount).toFixed(2)}</p>
                <p className="font-medium">• Nuevo total: €{(goal.currentAmount + parseFloat(amount)).toFixed(2)}</p>
                <p>• Nuevo progreso: {(((goal.currentAmount + parseFloat(amount)) / goal.targetAmount) * 100).toFixed(1)}%</p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Añadiendo...
                </>
              ) : (
                'Añadir Dinero'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 