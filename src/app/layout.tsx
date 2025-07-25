import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

import './globals.css';

/**
 * Configuración de la fuente Inter para una tipografía moderna y legible
 * Optimizada para aplicaciones financieras con números y datos
 */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * Metadatos de la aplicación optimizados para SEO y redes sociales
 * Incluye configuraciones específicas para aplicaciones financieras
 */
export const metadata: Metadata = {
  title: {
    default: 'Budget Couple App - Finanzas en Pareja',
    template: '%s | Budget Couple App',
  },
  description:
    'Aplicación financiera colaborativa para parejas. Gestiona ingresos, gastos y ahorros de forma inteligente con IA integrada.',
  keywords: [
    'finanzas',
    'pareja',
    'presupuesto',
    'ahorro',
    'gastos',
    'ingresos',
    'aplicación financiera',
  ],
  authors: [{ name: 'Budget Couple Team' }],
  creator: 'Budget Couple App',
  publisher: 'Budget Couple App',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: '/',
    title: 'Budget Couple App - Finanzas en Pareja',
    description: 'Gestiona tus finanzas en pareja de forma inteligente',
    siteName: 'Budget Couple App',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Budget Couple App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Budget Couple App - Finanzas en Pareja',
    description: 'Gestiona tus finanzas en pareja de forma inteligente',
    images: ['/og-image.png'],
  },
  robots: {
    index: false, // No indexar durante desarrollo
    follow: false,
  },
  verification: {
    // Agregar códigos de verificación cuando estén disponibles
    // google: 'google-verification-code',
    // yandex: 'yandex-verification-code',
  },
};

/**
 * Layout raíz de la aplicación con providers y configuraciones globales
 * Incluye SessionProvider para autenticación y Toaster para notificaciones
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
        {/* Precargar fuentes críticas */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Meta tags para PWA */}
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Budget Couple" />
        
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Provider de sesión para NextAuth.js */}
        <SessionProvider>
          {/* Layout principal de la aplicación */}
          <div className="min-h-screen bg-gray-50">
            {/* Área de contenido principal */}
            <main className="relative">
              {children}
            </main>
            
            {/* Sistema de notificaciones toast */}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#ffffff',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
                },
                success: {
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
          </div>
        </SessionProvider>
        
        {/* Scripts de terceros y analytics se cargarían aquí */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics, Hotjar, etc. */}
          </>
        )}
      </body>
    </html>
  );
} 