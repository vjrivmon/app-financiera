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

export default function EditGoalPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    description: '',
  });

  useEffect(() => {
    // Mock data based on ID
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
    setFormData({
      name: mockGoal.name,
      targetAmount: mockGoal.targetAmount.toString(),
      targetDate: mockGoal.targetDate || '',
      description: mockGoal.description || '',
    });
    setPriority(mockGoal.priority as 'LOW' | 'MEDIUM' | 'HIGH');
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount) {
      alert('Por favor, completa todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      console.log('📝 Editando objetivo:', { ...formData, priority });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`✅ Objetivo "${formData.name}" actualizado correctamente`);
      router.push('/dashboard/goals');
      
    } catch (error) {
      console.error('❌ Error editando objetivo:', error);
      alert('Error al editar el objetivo. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
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

  const getPriorityColor = (priorityLevel: string) => {
    switch (priorityLevel) {
      case 'LOW': return 'border-green-200 bg-green-50 text-green-700';
      case 'MEDIUM': return 'border-yellow-200 bg-yellow-50 text-yellow-700';
      case 'HIGH': return 'border-red-200 bg-red-50 text-red-700';
      default: return 'border-gray-200 text-gray-700';
    }
  };

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
          <span className="text-gray-900">Editar</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Editar Objetivo</h1>
        <p className="text-gray-600 mt-2">Modifica los detalles de tu objetivo de ahorro</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre del objetivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del objetivo *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Importe objetivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Importe objetivo *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">€</span>
              <input
                type="number"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Fecha objetivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha objetivo (opcional)
            </label>
            <input
              type="date"
              name="targetDate"
              value={formData.targetDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Prioridad
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPriority('LOW')}
                className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg transition-colors ${
                  priority === 'LOW' ? getPriorityColor('LOW') : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Baja
              </button>
              <button
                type="button"
                onClick={() => setPriority('MEDIUM')}
                className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg transition-colors ${
                  priority === 'MEDIUM' ? getPriorityColor('MEDIUM') : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                Media
              </button>
              <button
                type="button"
                onClick={() => setPriority('HIGH')}
                className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg transition-colors ${
                  priority === 'HIGH' ? getPriorityColor('HIGH') : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Alta
              </button>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Actualizando...
                </>
              ) : (
                'Actualizar Objetivo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 