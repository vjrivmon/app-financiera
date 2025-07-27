import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Página de Perfil de Usuario
 */
export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header de página */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600 mt-2">Gestiona tu información personal</p>
      </div>

      {/* Profile Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
            {session.user.image ? (
              <img 
                src={session.user.image} 
                alt="Avatar" 
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <span className="text-2xl font-semibold text-gray-600">
                {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{session.user.name}</h2>
            <p className="text-gray-600">{session.user.email}</p>
            <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
              Cambiar foto
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              value={session.user.name || ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={session.user.email || ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
              readOnly
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
} 