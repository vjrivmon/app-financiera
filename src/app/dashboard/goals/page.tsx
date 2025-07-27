import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

/**
 * Página de Objetivos de Ahorro con datos reales
 */
export default async function GoalsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  // Obtener objetivos reales de la base de datos
  let goals: any[] = [];
  try {
    // Buscar el usuario y su coupleId
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coupleId: true }
    });

    if (user?.coupleId) {
      goals = await prisma.savingsGoal.findMany({
        where: {
          coupleId: user.coupleId,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }
  } catch (error) {
    console.error('❌ Error cargando objetivos:', error);
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header de página - SIN botón duplicado */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Objetivos de Ahorro</h1>
          <p className="text-gray-600 mt-2">
            {goals.length > 0 ? 
              `Tienes ${goals.length} objetivo${goals.length !== 1 ? 's' : ''} de ahorro` :
              'Planifica y alcanza tus metas financieras'
            }
          </p>
        </div>
        {/* SOLO mostrar botón cuando HAY objetivos */}
        {goals.length > 0 && (
          <Link
            href="/dashboard/goals/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            + Nuevo Objetivo
          </Link>
        )}
      </div>

      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
            const isCompleted = progress >= 100;
            
            return (
              <div key={goal.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* Header del objetivo */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{goal.name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(goal.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full shrink-0 ml-2 ${
                    goal.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                    goal.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {goal.priority === 'HIGH' ? 'Alta' : goal.priority === 'MEDIUM' ? 'Media' : 'Baja'}
                  </span>
                </div>

                {/* Descripción */}
                {goal.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{goal.description}</p>
                )}

                {/* Progreso */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>€{Number(goal.currentAmount).toFixed(2)}</span>
                    <span>€{Number(goal.targetAmount).toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        isCompleted ? 'bg-green-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-sm font-medium ${
                      isCompleted ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {progress.toFixed(1)}% completado
                    </span>
                    {isCompleted && (
                      <span className="text-sm text-green-600 font-medium">¡Objetivo alcanzado! 🎉</span>
                    )}
                  </div>
                </div>

                {/* Fecha objetivo */}
                {goal.targetDate && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">
                      📅 Fecha objetivo: {new Date(goal.targetDate).toLocaleDateString('es-ES')}
                    </p>
                    {new Date(goal.targetDate) < new Date() && !isCompleted && (
                      <p className="text-sm text-red-600 mt-1">⚠️ Fecha límite pasada</p>
                    )}
                  </div>
                )}

                {/* Acciones - FUNCIONALES */}
                <div className="flex space-x-2">
                  <Link 
                    href={`/dashboard/goals/${goal.id}/add-money`}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm font-medium transition-colors text-center"
                  >
                    Añadir Dinero
                  </Link>
                  <Link 
                    href={`/dashboard/goals/${goal.id}/edit`}
                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm font-medium transition-colors text-center"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Estado vacío - SOLO aquí aparece el botón */
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
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" 
              />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tienes objetivos de ahorro
          </h3>
          
          <p className="text-gray-500 mb-6">
            Crea tu primer objetivo para empezar a ahorrar de manera organizada y alcanzar tus metas.
          </p>

          <Link 
            href="/dashboard/goals/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
          >
            + Nuevo Objetivo
          </Link>
        </div>
      )}

      {/* Tips */}
      {goals.length > 0 && (
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Consejos para alcanzar tus objetivos</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Establece metas realistas y alcanzables en el tiempo</li>
            <li>• Añade dinero regularmente, aunque sean pequeñas cantidades</li>
            <li>• Celebra los hitos del 25%, 50% y 75% de progreso</li>
            <li>• Ajusta las fechas objetivo si es necesario</li>
          </ul>
        </div>
      )}
    </div>
  );
} 