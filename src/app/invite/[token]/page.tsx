'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

interface InvitationData {
  id: string;
  token: string;
  coupleProfile: string;
  inviterName: string;
  inviterEmail: string;
  inviterAvatar?: string;
  expiresAt: string;
  createdAt: string;
}

/**
 * Página para aceptar invitaciones de pareja
 * Diseño unificado con el resto de la aplicación
 */
export default function InvitePage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  /**
   * Cargar información de la invitación
   */
  useEffect(() => {
    const loadInvitation = async () => {
      try {
        const response = await fetch(`/api/couple/accept?token=${params.token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al cargar la invitación');
        }

        setInvitation(data.invitation);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (params.token) {
      loadInvitation();
    }
  }, [params.token]);

  /**
   * Manejar aceptación de invitación
   */
  const handleAcceptInvitation = async () => {
    if (!session?.user) {
      // Redirigir a login y volver después
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
      return;
    }

    setAccepting(true);
    setError(null);

    try {
      const response = await fetch('/api/couple/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: params.token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al aceptar la invitación');
      }

      // Éxito - mostrar mensaje y redirigir
      alert('¡Perfecto! Te has unido como pareja exitosamente. Bienvenido/a a Budget Couple.');
      router.push(data.redirectTo || '/dashboard');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setAccepting(false);
    }
  };

  // Loading state
  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="animate-spin mx-auto w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">Cargando invitación...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md w-full text-center">
          {/* Header */}
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">Budget Couple</h1>
                <p className="text-sm text-gray-600">Finanzas para parejas</p>
              </div>
            </Link>
          </div>

          {/* Error Icon */}
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Invitación no válida
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>

          <div className="space-y-3">
            <Link
              href="/auth/register"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors inline-block"
            >
              Crear cuenta nueva
            </Link>
            <Link
              href="/auth/signin"
              className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors inline-block"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state - mostrar invitación
  if (invitation) {
    const expiresAt = new Date(invitation.expiresAt);
    const isExpired = expiresAt < new Date();

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">Budget Couple</h1>
                <p className="text-sm text-gray-600">Finanzas para parejas</p>
              </div>
            </Link>

            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Invitación de pareja
            </h2>
          </div>

          {/* Inviter Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                {invitation.inviterAvatar ? (
                  <Image 
                    src={invitation.inviterAvatar} 
                    alt={invitation.inviterName}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{invitation.inviterName}</p>
                <p className="text-sm text-gray-600">{invitation.inviterEmail}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>{invitation.inviterName}</strong> te ha invitado a gestionar finanzas juntos en 
                <strong> &ldquo;{invitation.coupleProfile}&rdquo;</strong>
              </p>
            </div>
          </div>

          {/* Status and actions */}
          {isExpired ? (
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600 font-medium">Esta invitación ha expirado</p>
                <p className="text-red-500 text-sm">Solicita una nueva invitación a tu pareja</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {!session ? (
                // Usuario no logueado
                <div>
                  <p className="text-center text-gray-600 mb-4">
                    Para aceptar la invitación, necesitas tener una cuenta
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={handleAcceptInvitation}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      Iniciar sesión y aceptar
                    </button>
                    <Link
                      href="/auth/register"
                      className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors text-center inline-block"
                    >
                      Crear cuenta nueva
                    </Link>
                  </div>
                </div>
              ) : (
                // Usuario logueado
                <div>
                  <p className="text-center text-gray-600 mb-4">
                    ¿Quieres formar pareja con <strong>{invitation.inviterName}</strong>?
                  </p>
                  <button
                    onClick={handleAcceptInvitation}
                    disabled={accepting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    {accepting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Aceptando...
                      </>
                    ) : (
                      '💑 Aceptar invitación'
                    )}
                  </button>
                </div>
              )}

              {/* Expiration info */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Esta invitación expira el {expiresAt.toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
} 