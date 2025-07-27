'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

/**
 * Página de error de autenticación
 * Muestra errores específicos de NextAuth.js de manera user-friendly
 */
export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  /**
   * Obtiene el mensaje de error apropiado basado en el tipo de error
   */
  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'Configuration':
        return {
          title: 'Error de Configuración',
          message: 'Hay un problema con la configuración del servidor. Por favor, contacta al soporte técnico.',
          icon: '⚙️'
        };
      case 'AccessDenied':
        return {
          title: 'Acceso Denegado',
          message: 'No tienes permisos para acceder a esta aplicación. Por favor, contacta al administrador.',
          icon: '🚫'
        };
      case 'Verification':
        return {
          title: 'Error de Verificación',
          message: 'El enlace de verificación ha expirado o ya fue usado. Solicita un nuevo enlace.',
          icon: '⏰'
        };
      case 'OAuthCallback':
        return {
          title: 'Error de OAuth',
          message: 'Hubo un problema al conectar con el proveedor de autenticación. Inténtalo de nuevo.',
          icon: '🔗'
        };
      case 'OAuthSignin':
        return {
          title: 'Error de Inicio de Sesión',
          message: 'No se pudo completar el inicio de sesión con el proveedor externo. Verifica tus permisos.',
          icon: '🔐'
        };
      case 'EmailSignin':
        return {
          title: 'Error de Email',
          message: 'No se pudo enviar el email de inicio de sesión. Verifica tu dirección de email.',
          icon: '📧'
        };
      case 'CredentialsSignin':
        return {
          title: 'Credenciales Inválidas',
          message: 'El email o contraseña son incorrectos. Por favor, verifica tus datos.',
          icon: '🔑'
        };
      case 'SessionRequired':
        return {
          title: 'Sesión Requerida',
          message: 'Necesitas iniciar sesión para acceder a esta página.',
          icon: '👤'
        };
      default:
        return {
          title: 'Error de Autenticación',
          message: 'Ocurrió un error inesperado durante la autenticación. Por favor, inténtalo de nuevo.',
          icon: '❌'
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Error Icon y Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">{errorInfo.icon}</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {errorInfo.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ha ocurrido un problema con la autenticación
          </p>
        </div>

        {/* Mensaje de error */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Detalles del Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errorInfo.message}</p>
                </div>
                {error && (
                  <div className="mt-2 text-xs text-red-600">
                    <p>Código de error: {error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Acciones disponibles */}
          <div className="space-y-4">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => window.location.href = '/auth/signin'}
            >
              Intentar de Nuevo
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              Volver al Inicio
            </Button>
          </div>

          {/* Información de contacto */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                ¿Persiste el problema?
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Contacta a soporte técnico con el código de error mostrado arriba
              </p>
            </div>
          </div>
        </div>

        {/* Consejos de solución */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            💡 Consejos para resolver el problema:
          </h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Verifica que tu conexión a internet sea estable</li>
            <li>• Intenta cerrar y abrir tu navegador</li>
            <li>• Borra las cookies y caché del navegador</li>
            <li>• Si usas OAuth, verifica los permisos de la aplicación</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 