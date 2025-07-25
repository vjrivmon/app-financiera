/**
 * Componente Button reutilizable para la aplicación financiera
 * Diseño inspirado en Budget app con variantes flexibles
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Variantes del botón usando class-variance-authority
 * Permite combinaciones flexibles de estilos
 */
const buttonVariants = cva(
  // Estilos base aplicados a todos los botones
  [
    'inline-flex items-center justify-center rounded-xl text-sm font-medium',
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    'active:scale-95 select-none',
  ],
  {
    variants: {
      // Variantes de estilo visual
      variant: {
        // Botón primario - Para acciones principales
        primary: [
          'bg-primary-500 text-white shadow-sm hover:bg-primary-600',
          'focus-visible:ring-primary-500 dark:bg-primary-600 dark:hover:bg-primary-700',
        ],
        // Botón secundario - Para acciones secundarias
        secondary: [
          'bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200',
          'focus-visible:ring-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
        ],
        // Botón de éxito - Para confirmaciones
        success: [
          'bg-green-500 text-white shadow-sm hover:bg-green-600',
          'focus-visible:ring-green-500 dark:bg-green-600 dark:hover:bg-green-700',
        ],
        // Botón de advertencia - Para acciones de precaución
        warning: [
          'bg-amber-500 text-white shadow-sm hover:bg-amber-600',
          'focus-visible:ring-amber-500 dark:bg-amber-600 dark:hover:bg-amber-700',
        ],
        // Botón de peligro - Para acciones destructivas
        danger: [
          'bg-red-500 text-white shadow-sm hover:bg-red-600',
          'focus-visible:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700',
        ],
        // Botón fantasma - Transparente con borde
        ghost: [
          'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
          'focus-visible:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100',
        ],
        // Botón de enlace - Estilo minimalista
        link: [
          'text-primary-600 underline-offset-4 hover:underline hover:text-primary-700',
          'focus-visible:ring-primary-500 dark:text-primary-400 dark:hover:text-primary-300',
        ],
        // Botón con contorno
        outline: [
          'border border-gray-300 bg-transparent text-gray-700 shadow-sm hover:bg-gray-50',
          'focus-visible:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
        ],
      },
      // Variantes de tamaño
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10 p-0', // Para botones solo con icono
      },
      // Variantes de ancho
      width: {
        auto: 'w-auto',
        full: 'w-full',
        fit: 'w-fit',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      width: 'auto',
    },
  }
);

/**
 * Props del componente Button
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Mostrar indicador de carga */
  loading?: boolean;
  /** Texto alternativo cuando está cargando */
  loadingText?: string;
  /** Icono a mostrar antes del texto */
  leftIcon?: React.ReactNode;
  /** Icono a mostrar después del texto */
  rightIcon?: React.ReactNode;
  /** Convertir en un elemento as (útil para Next.js Link) */
  asChild?: boolean;
}

/**
 * Componente Button con todas las variantes y estados
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      width,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    // Determinar si el botón está deshabilitado
    const isDisabled = disabled || loading;

    // Contenido del botón cuando está cargando
    const loadingContent = (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {loadingText || children}
      </>
    );

    // Contenido normal del botón
    const normalContent = (
      <>
        {leftIcon && (
          <span className="mr-2 flex-shrink-0">
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon && (
          <span className="ml-2 flex-shrink-0">
            {rightIcon}
          </span>
        )}
      </>
    );

    // Si asChild es true, renderizar solo las clases (útil para Slot de Radix)
    if (asChild) {
      return (
        <div
          className={cn(buttonVariants({ variant, size, width, className }))}
          {...(props as React.HTMLAttributes<HTMLDivElement>)}
        >
          {loading ? loadingContent : normalContent}
        </div>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, width, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading ? loadingContent : normalContent}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };

/**
 * Componente específico para botones de iconos
 */
export const IconButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> & {
    icon: React.ReactNode;
    'aria-label': string;
  }
>(({ icon, className, size = 'icon', ...props }, ref) => {
  return (
    <Button
      ref={ref}
      size={size}
      className={cn('p-0', className)}
      {...props}
    >
      {icon}
    </Button>
  );
});

IconButton.displayName = 'IconButton';

/**
 * Componente para grupos de botones
 */
export const ButtonGroup: React.FC<{
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}> = ({ children, orientation = 'horizontal', className }) => {
  const groupClasses = cn(
    'inline-flex',
    orientation === 'horizontal' 
      ? 'flex-row [&>button:not(:first-child)]:rounded-l-none [&>button:not(:last-child)]:rounded-r-none [&>button:not(:last-child)]:border-r-0'
      : 'flex-col [&>button:not(:first-child)]:rounded-t-none [&>button:not(:last-child)]:rounded-b-none [&>button:not(:last-child)]:border-b-0',
    className
  );

  return <div className={groupClasses}>{children}</div>;
};

/**
 * Componente para botones flotantes (FAB)
 */
export const FloatingActionButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'size' | 'variant'> & {
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  }
>(({ className, position = 'bottom-right', ...props }, ref) => {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6',
  };

  return (
    <Button
      ref={ref}
      variant="primary"
      size="lg"
      className={cn(
        'rounded-full shadow-lg hover:shadow-xl z-50',
        'h-14 w-14 p-0',
        positionClasses[position],
        className
      )}
      {...props}
    />
  );
});

FloatingActionButton.displayName = 'FloatingActionButton'; 