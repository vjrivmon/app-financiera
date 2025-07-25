'use client';

/**
 * Header del dashboard con información del usuario y acciones rápidas
 * Diseño inspirado en Budget app con enfoque mobile-first
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import {
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Heart,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn, getInitials, getGreeting } from '@/lib/utils';
import Link from 'next/link';

/**
 * Props del componente DashboardHeader
 */
interface DashboardHeaderProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    avatar?: string | null;
    coupleName?: string | null;
  };
}

/**
 * Componente header del dashboard
 */
export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications] = useState([]); // TODO: Implementar notificaciones reales

  // Determinar el nombre a mostrar
  const displayName = user.name || user.email.split('@')[0];
  const greeting = getGreeting();
  const hasNotifications = notifications.length > 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 safe-top">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo y saludo (lado izquierdo) */}
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:block text-xl font-bold text-gray-900">
              Budget Couple
            </span>
          </Link>

          {/* Saludo personalizado (solo desktop) */}
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-gray-900">
              {greeting}, {displayName}
            </h1>
            {user.coupleName && (
              <p className="text-sm text-gray-500">{user.coupleName}</p>
            )}
          </div>
        </div>

        {/* Acciones del header (lado derecho) */}
        <div className="flex items-center space-x-2">
          {/* Botón de búsqueda (desktop) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex"
            aria-label="Buscar"
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Botón de agregar transacción rápida */}
          <Link href="/dashboard/transactions/new">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              className="hidden sm:flex"
            >
              Agregar
            </Button>
          </Link>

          {/* Notificaciones */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notificaciones"
            >
              <Bell className="w-5 h-5" />
              {hasNotifications && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </Button>
          </div>

          {/* Menú de perfil */}
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center space-x-2 p-2"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              {/* Avatar */}
              <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(displayName || 'Usuario')
                )}
              </div>

              {/* Nombre (solo desktop) */}
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {displayName}
              </span>

              {/* Chevron */}
              <ChevronDown 
                className={cn(
                  "w-4 h-4 text-gray-500 transition-transform duration-200",
                  isProfileMenuOpen && "rotate-180"
                )}
              />
            </Button>

            {/* Dropdown del perfil */}
            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                >
                  {/* Información del usuario */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    {user.coupleName && (
                      <p className="text-xs text-blue-600 mt-1">
                        👫 {user.coupleName}
                      </p>
                    )}
                  </div>

                  {/* Opciones del menú */}
                  <div className="py-2">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Mi perfil</span>
                    </Link>

                    <Link
                      href="/dashboard/settings"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Configuración</span>
                    </Link>

                    <div className="border-t border-gray-100 my-2" />

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Overlay para cerrar menú en mobile */}
      {isProfileMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </header>
  );
} 