'use client';

/**
 * Providers del lado del cliente para la aplicación
 * Maneja SessionProvider y otros contexts que requieren Client Components
 */

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

interface ClientProvidersProps {
  children: ReactNode;
}

/**
 * Componente que wrappea todos los providers que requieren Client Components
 * Incluye SessionProvider para autenticación y Toaster para notificaciones
 */
export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SessionProvider>
      {children}
      
      {/* Toast notifications con configuración personalizada */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Configuración global para los toasts
          className: '',
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            fontSize: '14px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e5e7eb',
            padding: '16px',
          },
          
          // Estilos específicos por tipo
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #d1fae5',
              background: '#f0fdf4',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #fecaca',
              background: '#fef2f2',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
        }}
      />
    </SessionProvider>
  );
} 