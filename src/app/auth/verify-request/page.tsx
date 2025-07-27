'use client';

import { Button } from '@/components/ui/Button';

/**
 * Página de verificación de email
 * Se muestra después de solicitar un enlace de autenticación por email
 */
export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Verifica tu Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Te hemos enviado un enlace de acceso seguro
          </p>
        </div>

        {/* Contenido principal */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          {/* Ícono de éxito */}
          <div className="text-center mb-6">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Mensaje principal */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ¡Email Enviado Exitosamente!
            </h3>
            <p className="text-sm text-gray-600">
              Hemos enviado un enlace de inicio de sesión seguro a tu dirección de email.
              Haz clic en el enlace del email para acceder a tu cuenta.
            </p>
          </div>

          {/* Instrucciones */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              📋 Instrucciones:
            </h4>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>Revisa tu bandeja de entrada</li>
              <li>Busca un email de "Budget Couple App"</li>
              <li>Haz clic en el enlace "Iniciar Sesión"</li>
              <li>Serás redirigido automáticamente</li>
            </ol>
          </div>

          {/* Acciones */}
          <div className="space-y-4">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => window.location.href = '/auth/signin'}
            >
              Volver a Inicio de Sesión
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              Ir al Inicio
            </Button>
          </div>

          {/* Información adicional */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500">
                ¿No recibiste el email?
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-400">
                  • Revisa tu carpeta de spam
                </p>
                <p className="text-xs text-gray-400">
                  • Verifica que el email sea correcto
                </p>
                <p className="text-xs text-gray-400">
                  • El enlace expira en 24 horas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nota de seguridad */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            🔒 Por tu seguridad, nunca compartas este enlace con otras personas
          </p>
        </div>
      </div>
    </div>
  );
} 