/**
 * Utilidades y helpers para la aplicación financiera
 * Funciones reutilizables para formateo, validación y cálculos
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid, differenceInDays, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Combinar clases de Tailwind CSS de forma segura
 * Evita conflictos entre clases similares
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatear cantidades monetarias según la configuración regional
 */
export function formatCurrency(
  amount: number | string, 
  currency: string = 'EUR',
  locale: string = 'es-ES'
): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '€0,00';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch (error) {
    // Fallback si la configuración regional falla
    return `€${numericAmount.toFixed(2).replace('.', ',')}`;
  }
}

/**
 * Formatear cantidades sin símbolo de moneda
 */
export function formatAmount(amount: number | string): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '0,00';
  }

  return numericAmount.toFixed(2).replace('.', ',');
}

/**
 * Formatear números grandes con abreviaciones (K, M, etc.)
 */
export function formatCompactNumber(
  amount: number | string,
  locale: string = 'es-ES'
): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '0';
  }

  try {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(numericAmount);
  } catch (error) {
    // Fallback manual
    if (numericAmount >= 1000000) {
      return `${(numericAmount / 1000000).toFixed(1)}M`;
    } else if (numericAmount >= 1000) {
      return `${(numericAmount / 1000).toFixed(1)}K`;
    }
    return numericAmount.toString();
  }
}

/**
 * Formatear fechas para diferentes contextos
 */
export function formatDate(
  date: Date | string,
  formatStr: string = 'dd/MM/yyyy'
): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return 'Fecha inválida';
    }

    return format(dateObj, formatStr, { locale: es });
  } catch (error) {
    return 'Fecha inválida';
  }
}

/**
 * Formatear fecha relativa (hace X días, hace X semanas, etc.)
 */
export function formatRelativeDate(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return 'Fecha inválida';
    }

    const daysDiff = differenceInDays(new Date(), dateObj);
    
    if (daysDiff === 0) {
      return 'Hoy';
    } else if (daysDiff === 1) {
      return 'Ayer';
    } else if (daysDiff < 7) {
      return `Hace ${daysDiff} días`;
    } else if (daysDiff < 30) {
      const weeks = Math.floor(daysDiff / 7);
      return weeks === 1 ? 'Hace 1 semana' : `Hace ${weeks} semanas`;
    } else if (daysDiff < 365) {
      const months = Math.floor(daysDiff / 30);
      return months === 1 ? 'Hace 1 mes' : `Hace ${months} meses`;
    } else {
      const years = Math.floor(daysDiff / 365);
      return years === 1 ? 'Hace 1 año' : `Hace ${years} años`;
    }
  } catch (error) {
    return 'Fecha inválida';
  }
}

/**
 * Calcular porcentaje de progreso
 */
export function calculateProgress(current: number, target: number): number {
  if (target <= 0) return 0;
  const progress = (current / target) * 100;
  return Math.min(Math.max(progress, 0), 100); // Limitar entre 0 y 100
}

/**
 * Formatear porcentaje
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Generar color basado en string (para avatars, categorías, etc.)
 */
export function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 60%)`;
}

/**
 * Obtener iniciales de un nombre
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Validar si una fecha está en el rango del mes actual
 */
export function isCurrentMonth(date: Date | string): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    return dateObj >= monthStart && dateObj <= monthEnd;
  } catch (error) {
    return false;
  }
}

/**
 * Obtener rango de fechas para el mes actual
 */
export function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now)
  };
}

/**
 * Obtener rango de fechas para un mes específico
 */
export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  const date = new Date(year, month, 1);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date)
  };
}

/**
 * Calcular la próxima fecha para transacciones recurrentes
 */
export function calculateNextRecurrenceDate(
  lastDate: Date,
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
): Date {
  const date = new Date(lastDate);
  
  switch (frequency) {
    case 'DAILY':
      date.setDate(date.getDate() + 1);
      break;
    case 'WEEKLY':
      date.setDate(date.getDate() + 7);
      break;
    case 'MONTHLY':
      return addMonths(date, 1);
    case 'YEARLY':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      throw new Error(`Frecuencia no soportada: ${frequency}`);
  }
  
  return date;
}

/**
 * Truncar texto con elipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Validar si un email es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generar un ID único simple
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Formatear número de teléfono español
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('34')) {
    return `+34 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  return phone; // Devolver original si no se puede formatear
}

/**
 * Debounce function para optimizar búsquedas
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function para limitar frecuencia de ejecución
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Capitalizar primera letra de cada palabra
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Obtener el saludo apropiado según la hora
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'Buenos días';
  } else if (hour < 18) {
    return 'Buenas tardes';
  } else {
    return 'Buenas noches';
  }
}

/**
 * Calcular días restantes hasta una fecha
 */
export function getDaysUntil(targetDate: Date | string): number {
  try {
    const target = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate;
    const today = new Date();
    return differenceInDays(target, today);
  } catch (error) {
    return 0;
  }
}

/**
 * Determinar si un gasto es "grande" basado en el historial
 */
export function isLargeExpense(amount: number, threshold: number = 100): boolean {
  return amount >= threshold;
}

/**
 * Calcular estadísticas básicas de un array de números
 */
export function calculateStats(numbers: number[]): {
  sum: number;
  average: number;
  min: number;
  max: number;
  count: number;
} {
  if (numbers.length === 0) {
    return { sum: 0, average: 0, min: 0, max: 0, count: 0 };
  }
  
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const average = sum / numbers.length;
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  
  return { sum, average, min, max, count: numbers.length };
}

/**
 * Escapar caracteres especiales para RegExp
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Convertir objeto a query string
 */
export function objectToQueryString(obj: Record<string, unknown>): string {
  const params = new URLSearchParams();
  
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  
  return params.toString();
}

/**
 * Obtener el emoji apropiado para una categoría de gasto
 */
export function getCategoryEmoji(categoryName: string): string {
  const emojiMap: Record<string, string> = {
    'comida': '🍽️',
    'transporte': '🚗',
    'vivienda': '🏠',
    'entretenimiento': '🎬',
    'salud': '💊',
    'educación': '📚',
    'compras': '🛍️',
    'servicios': '⚡',
    'nómina': '💼',
    'freelance': '💻',
    'propinas': '💰',
    'bonus': '🎁'
  };
  
  const key = categoryName.toLowerCase();
  return emojiMap[key] || '💳';
} 