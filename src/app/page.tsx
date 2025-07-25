import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import LandingPage from '@/components/landing/LandingPage';

/**
 * Página principal de la aplicación
 * Redirige al dashboard si el usuario está autenticado, 
 * o muestra la landing page si no lo está
 */
export default async function HomePage() {
  // Obtener sesión del servidor para verificar autenticación
  const session = await getServerSession(authOptions);

  // Si el usuario está autenticado, redirigir al dashboard
  if (session?.user) {
    redirect('/dashboard');
  }

  // Si no está autenticado, mostrar landing page
  return <LandingPage />;
} 