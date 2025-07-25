/**
 * Hook personalizado para gestionar localStorage de forma segura
 * Con soporte completo para TypeScript y SSR
 */

import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((val: T) => T);

/**
 * Hook para manejar localStorage con type safety
 * @param key - Clave del localStorage
 * @param initialValue - Valor inicial si no existe en localStorage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] {
  // Estado para almacenar el valor
  // Evita el hydration mismatch usando una función lazy
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Función para actualizar el valor
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        // Permitir que value sea una función para mantener la API consistente con useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Guardar en el estado
        setStoredValue(valueToStore);
        
        // Guardar en localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          
          // Disparar evento personalizado para sincronización entre tabs
          window.dispatchEvent(
            new CustomEvent('local-storage', {
              detail: {
                key,
                newValue: valueToStore,
              },
            })
          );
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Función para remover el valor
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        
        // Disparar evento personalizado
        window.dispatchEvent(
          new CustomEvent('local-storage', {
            detail: {
              key,
              newValue: undefined,
            },
          })
        );
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Escuchar cambios de localStorage para sincronización entre tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ('key' in e && e.key === key) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error parsing localStorage key "${key}":`, error);
        }
      } else if ('detail' in e && e.detail.key === key) {
        // Evento personalizado (mismo tab)
        setStoredValue(e.detail.newValue ?? initialValue);
      }
    };

    // Escuchar cambios del navegador (otros tabs)
    window.addEventListener('storage', handleStorageChange as EventListener);
    
    // Escuchar nuestros eventos personalizados (mismo tab)
    window.addEventListener('local-storage', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('local-storage', handleStorageChange as EventListener);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook específico para preferencias de usuario en la aplicación financiera
 */
export function useUserPreferences() {
  return useLocalStorage('user-preferences', {
    theme: 'light' as 'light' | 'dark' | 'system',
    currency: 'EUR',
    language: 'es',
    dateFormat: 'dd/MM/yyyy',
    showDecimalPlaces: true,
    compactNumbers: false,
    showCategoryIcons: true,
    defaultTransactionView: 'list' as 'list' | 'grid',
    dashboardLayout: 'default' as 'default' | 'compact' | 'detailed',
  });
}

/**
 * Hook para gestionar filtros de transacciones en localStorage
 */
export function useTransactionFilters() {
  return useLocalStorage('transaction-filters', {
    dateRange: 'current-month' as 'current-month' | 'last-month' | 'current-year' | 'custom',
    categories: [] as string[],
    transactionTypes: [] as ('INCOME' | 'EXPENSE')[],
    amountRange: { min: undefined, max: undefined } as { min?: number; max?: number },
    sortBy: 'date' as 'date' | 'amount' | 'description',
    sortOrder: 'desc' as 'asc' | 'desc',
  });
}

/**
 * Hook para gestionar configuraciones del dashboard
 */
export function useDashboardConfig() {
  return useLocalStorage('dashboard-config', {
    visibleWidgets: [
      'balance-summary',
      'recent-transactions',
      'budget-overview',
      'savings-goals',
      'expense-categories',
    ],
    widgetOrder: [
      'balance-summary',
      'recent-transactions',
      'budget-overview',
      'savings-goals',
      'expense-categories',
    ],
    compactMode: false,
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para gestionar el historial de búsquedas
 */
export function useSearchHistory() {
  const [history, setHistory, clearHistory] = useLocalStorage<string[]>('search-history', []);

  const addSearch = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) return;
      
      setHistory(prev => {
        const filtered = prev.filter(term => term !== searchTerm);
        return [searchTerm, ...filtered].slice(0, 10); // Mantener solo los últimos 10
      });
    },
    [setHistory]
  );

  const removeSearch = useCallback(
    (searchTerm: string) => {
      setHistory(prev => prev.filter(term => term !== searchTerm));
    },
    [setHistory]
  );

  return {
    history,
    addSearch,
    removeSearch,
    clearHistory,
  };
}

/**
 * Hook para gestionar drafts de formularios
 */
export function useFormDraft<T extends Record<string, unknown>>(
  formKey: string,
  initialValues: T
) {
  const [draft, setDraft, clearDraft] = useLocalStorage<Partial<T>>(`form-draft-${formKey}`, {});

  const saveDraft = useCallback(
    (values: Partial<T>) => {
      setDraft(values);
    },
    [setDraft]
  );

  const getDraftValues = useCallback((): T => {
    return { ...initialValues, ...draft };
  }, [initialValues, draft]);

  const hasDraft = Object.keys(draft).length > 0;

  return {
    draft,
    saveDraft,
    clearDraft,
    getDraftValues,
    hasDraft,
  };
}

/**
 * Hook para gestionar configuraciones de notificaciones
 */
export function useNotificationSettings() {
  return useLocalStorage('notification-settings', {
    browserNotifications: true,
    budgetAlerts: true,
    goalReminders: true,
    transactionReminders: true,
    weeklyReports: true,
    monthlyReports: true,
    soundEnabled: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });
} 