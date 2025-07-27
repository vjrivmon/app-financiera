'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

/**
 * Página de bienvenida para nuevos usuarios
 * Se muestra después del primer registro exitoso
 */
export default function NewUserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Redirige al dashboard si el usuario ya está autenticado
   */
  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  /**
   * Maneja la continuación al dashboard
   */
  const handleContinue = async () => {
    setIsLoading(true);
    router.push('/dashboard');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-emerald-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header de bienvenida */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg
              className="h-8 w-8 text-emerald-600"
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
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            ¡Bienvenido a Budget Couple App!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Tu cuenta ha sido creada exitosamente
          </p>
        </div>

        {/* Contenido principal */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          {/* Mensaje de bienvenida personalizado */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ¡Hola {session?.user?.name || 'Usuario'}! 👋
            </h3>
            <p className="text-sm text-gray-600">
              Estás listo para comenzar a gestionar tus finanzas de pareja de manera inteligente.
            </p>
          </div>

          {/* Características destacadas */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              🎯 ¿Qué puedes hacer ahora?
            </h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-xs text-emerald-600">💰</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Registrar transacciones</span> y categorizar tus gastos e ingresos
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-xs text-emerald-600">📊</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Crear presupuestos</span> y recibir alertas cuando te acerques a los límites
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-xs text-emerald-600">🎯</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Establecer objetivos de ahorro</span> y hacer seguimiento de tu progreso
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-xs text-emerald-600">👥</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Invitar a tu pareja</span> para gestionar las finanzas juntos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón para continuar */}
          <div className="space-y-4">
            <Button
              variant="primary"
              className="w-full"
              onClick={handleContinue}
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : 'Comenzar a Usar la App'}
            </Button>
          </div>

          {/* Información adicional */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">
                💡 <span className="font-medium">Tip:</span> Puedes cambiar tus preferencias en cualquier momento desde la configuración
              </p>
            </div>
          </div>
        </div>

        {/* Nota de seguridad */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            🔒 Tu privacidad y seguridad
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Todos tus datos están encriptados</li>
            <li>• Solo tú y tu pareja pueden ver vuestra información</li>
            <li>• Puedes exportar o eliminar tus datos cuando quieras</li>
            <li>• Nunca compartimos tu información con terceros</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 