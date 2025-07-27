import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Página de Transacciones - Gestión financiera completa
 */
export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header de página */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transacciones</h1>
        <p className="text-gray-600 mt-2">Gestiona tus ingresos y gastos</p>
      </div>

      {/* Estado vacío */}
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg 
            className="w-8 h-8 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" 
            />
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No hay transacciones aún
        </h3>
        
        <p className="text-gray-500 mb-6">
          Comienza registrando tu primera transacción para ver tu actividad financiera aquí.
        </p>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          + Nueva Transacción
        </button>
      </div>
    </div>
  );
} 