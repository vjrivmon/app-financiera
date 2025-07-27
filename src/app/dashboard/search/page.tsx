import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Página de Resultados de Búsqueda
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  const query = searchParams.q || '';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header de página */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Resultados de búsqueda
        </h1>
        {query && (
          <p className="text-gray-600 mt-2">
            Mostrando resultados para: <span className="font-semibold">&quot;{query}&quot;</span>
          </p>
        )}
      </div>

      {/* Results */}
      {query ? (
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron resultados
          </h3>
          
          <p className="text-gray-500 mb-6">
            No hemos encontrado transacciones o categorías que coincidan con tu búsqueda.
          </p>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Nueva Búsqueda
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Realiza una búsqueda
          </h3>
          <p className="text-gray-500">
            Usa la barra de búsqueda para encontrar transacciones, categorías o información específica.
          </p>
        </div>
      )}
    </div>
  );
} 