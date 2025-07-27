import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Página para crear nuevo objetivo de ahorro
 */
export default async function NewGoalPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Objetivo de Ahorro</h1>
        <p className="text-gray-600 mt-2">Define una meta financiera para alcanzar</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form className="space-y-6">
          {/* Nombre del objetivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del objetivo *
            </label>
            <input
              type="text"
              placeholder="Ej: Vacaciones de verano, Coche nuevo, Fondo de emergencia"
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
                step="0.01"
                placeholder="5000,00"
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
                className="flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-gray-300"
              >
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Baja
              </button>
              <button
                type="button"
                className="flex items-center justify-center px-4 py-3 border-2 border-yellow-200 rounded-lg hover:border-yellow-300 bg-yellow-50"
              >
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                Media
              </button>
              <button
                type="button"
                className="flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-gray-300"
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
              rows={4}
              placeholder="Describe tu objetivo y por qué es importante para ti..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Aporte inicial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aporte inicial (opcional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">€</span>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Puedes empezar con cualquier cantidad que tengas disponible
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Crear Objetivo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 