'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface CoupleInfo {
  hasPartner: boolean;
  partnerName?: string;
  partnerEmail?: string;
  coupleName?: string;
  canInvite: boolean;
}

interface PendingInvitation {
  id: string;
  token: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

/**
 * Página de perfil de usuario con gestión de pareja
 */
export default function ProfilePage() {
  const { data: session } = useSession();
  const [coupleInfo, setCoupleInfo] = useState<CoupleInfo | null>(null);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Cargar información de pareja
   */
  useEffect(() => {
    const loadCoupleInfo = async () => {
      try {
        // Aquí cargaríamos la información real de la base de datos
        // Por simplicidad, simulamos la estructura
        setCoupleInfo({
          hasPartner: false,
          canInvite: true,
        });

        // Cargar invitaciones pendientes
        const response = await fetch('/api/couple/invite');
        if (response.ok) {
          const data = await response.json();
          setPendingInvitations(data.invitations || []);
        }
      } catch (error) {
        console.error('Error cargando información de pareja:', error);
      }
    };

    if (session?.user) {
      loadCoupleInfo();
    }
  }, [session]);

  /**
   * Enviar invitación de pareja
   */
  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/couple/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerEmail: inviteEmail,
          message: inviteMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar invitación');
      }

      setSuccess('¡Invitación enviada exitosamente!');
      setInviteEmail('');
      setInviteMessage('');
      setShowInviteForm(false);

      // Copiar enlace al portapapeles
      if (data.inviteUrl && navigator.clipboard) {
        await navigator.clipboard.writeText(data.inviteUrl);
        alert(`Invitación enviada exitosamente.\n\nEnlace copiado al portapapeles:\n${data.inviteUrl}\n\nCompártelo con tu pareja.`);
      } else {
        alert(`Invitación creada exitosamente.\n\nEnlace para compartir:\n${data.inviteUrl}`);
      }

      // Recargar invitaciones
      const inviteResponse = await fetch('/api/couple/invite');
      if (inviteResponse.ok) {
        const inviteData = await inviteResponse.json();
        setPendingInvitations(inviteData.invitations || []);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600 mt-2">Gestiona tu información personal y configuración de pareja</p>
      </div>

      <div className="space-y-8">
        {/* Información personal */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Personal</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {session?.user?.name || 'No disponible'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {session?.user?.email || 'No disponible'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado de verificación
              </label>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Email verificado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gestión de pareja */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">👫 Gestión de Pareja</h3>
          
          {coupleInfo?.hasPartner ? (
            /* Usuario con pareja */
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-green-900 mb-2">
                  {coupleInfo.coupleName || 'Pareja conectada'}
                </h4>
                <p className="text-sm text-green-700">
                  Conectado con: <strong>{coupleInfo.partnerName}</strong>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {coupleInfo.partnerEmail}
                </p>
              </div>

              <div className="flex space-x-3">
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm transition-colors">
                  ⚙️ Configurar pareja
                </button>
                <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-lg text-sm transition-colors">
                  💔 Desconectar pareja
                </button>
              </div>
            </div>
          ) : (
            /* Usuario sin pareja */
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">Sin pareja configurada</h4>
                <p className="text-sm text-blue-700">
                  Invita a tu pareja para gestionar finanzas juntos
                </p>
              </div>

              {!showInviteForm ? (
                <div className="text-center">
                  <button
                    onClick={() => setShowInviteForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors inline-flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Invitar Pareja
                  </button>
                </div>
              ) : (
                /* Formulario de invitación */
                <div className="max-w-2xl">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Enviar Invitación</h4>
                  <form onSubmit={handleSendInvitation} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email de tu pareja *
                      </label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="pareja@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mensaje personalizado (opcional)
                      </label>
                      <textarea
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                        placeholder="¡Hola! Te invito a gestionar nuestras finanzas juntos..."
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {inviteMessage.length}/500 caracteres
                      </p>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}

                    {success && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-600 text-sm">{success}</p>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowInviteForm(false);
                          setError(null);
                          setSuccess(null);
                        }}
                        className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 py-2 px-4 rounded-lg text-sm transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enviando...
                          </>
                        ) : (
                          'Enviar Invitación'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Invitaciones pendientes */}
              {pendingInvitations.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    📤 Invitaciones Pendientes ({pendingInvitations.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingInvitations.map((invitation) => (
                      <div key={invitation.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Invitación enviada</p>
                            <p className="text-xs text-yellow-600">
                              Expira: {new Date(invitation.expiresAt).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pendiente
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Configuraciones adicionales */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Configuraciones</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Notificaciones por email</h4>
                <p className="text-sm text-gray-500">Recibir alertas importantes por correo</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input type="checkbox" name="toggle" id="email-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                <label htmlFor="email-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Recordatorios de presupuesto</h4>
                <p className="text-sm text-gray-500">Avisos cuando te acerques a límites</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input type="checkbox" name="toggle" id="budget-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                <label htmlFor="budget-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
              </div>
            </div>

            <div className="pt-4">
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm transition-colors">
                💾 Guardar Configuraciones
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 