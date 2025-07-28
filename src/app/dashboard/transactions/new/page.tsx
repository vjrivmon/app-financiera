'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Interfaz para las categorías
 */
interface Category {
  id: string;
  name: string;
  icon: string;
  type: string;
}

/**
 * Página para crear nueva transacción con categorías dinámicas
 */
export default function NewTransactionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactionType, setTransactionType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Cargar categorías disponibles al montar el componente
   */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('🔄 Cargando categorías...');
        const response = await fetch('/api/categories');
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Categorías cargadas:', data.categories?.length || 0);
          setCategories(data.categories || []);
        } else {
          console.warn('⚠️ No se pudieron cargar las categorías, usando fallback');
          // Usar categorías por defecto como fallback
          setCategories([
            { id: 'alimentacion', name: 'Alimentación', icon: '🍽️', type: 'EXPENSE' },
            { id: 'transporte', name: 'Transporte', icon: '🚗', type: 'EXPENSE' },
            { id: 'vivienda', name: 'Vivienda', icon: '🏠', type: 'EXPENSE' },
            { id: 'trabajo', name: 'Trabajo', icon: '💼', type: 'INCOME' },
            { id: 'otros', name: 'Otros', icon: '📦', type: 'EXPENSE' }
          ]);
        }
      } catch (error) {
        console.error('❌ Error cargando categorías:', error);
        setCategories([
          { id: 'alimentacion', name: 'Alimentación', icon: '🍽️', type: 'EXPENSE' },
          { id: 'transporte', name: 'Transporte', icon: '🚗', type: 'EXPENSE' },
          { id: 'vivienda', name: 'Vivienda', icon: '🏠', type: 'EXPENSE' },
          { id: 'trabajo', name: 'Trabajo', icon: '💼', type: 'INCOME' },
          { id: 'otros', name: 'Otros', icon: '📦', type: 'EXPENSE' }
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  /**
   * Filtrar categorías por tipo de transacción
   */
  const filteredCategories = categories.filter(cat =>
    cat.type === transactionType || cat.name === 'Otros'
  );

  /**
   * Manejar cambios en inputs del formulario
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) {
      setError(null);
    }
    if (success) {
      setSuccess(null);
    }
  };

  /**
   * Manejar cambio de tipo de transacción
   */
  const handleTypeChange = (type: 'INCOME' | 'EXPENSE') => {
    setTransactionType(type);
    setFormData(prev => ({
      ...prev,
      categoryId: '' // Reset category when changing type
    }));
    setError(null);
    setSuccess(null);
  };

  /**
   * Manejar envío del formulario con validación robusta
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validación más robusta
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Por favor, ingresa un monto válido mayor a 0');
      }

      if (!formData.description.trim()) {
        throw new Error('Por favor, ingresa una descripción');
      }

      if (!formData.categoryId) {
        throw new Error('Por favor, selecciona una categoría');
      }

      const transactionData = {
        type: transactionType,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        date: formData.date,
        notes: formData.notes.trim() || undefined,
      };

      console.log('💰 Enviando transacción a API:', transactionData);

      // Llamar a la API
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Error ${response.status}: No se pudo crear la transacción`);
      }

      console.log('✅ Transacción creada exitosamente:', result);
      
      // Mostrar mensaje de éxito
      const typeText = transactionType === 'INCOME' ? 'Ingreso' : 'Gasto';
      setSuccess(`${typeText} de €${formData.amount} registrado correctamente`);
      
      // Limpiar formulario
      setFormData({
        amount: '',
        description: '',
        categoryId: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard/transactions');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error creando transacción:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear la transacción';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar cancelación
   */
  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nueva Transacción</h1>
        <p className="text-gray-600 mt-2">Registra un nuevo ingreso o gasto</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-green-800">¡Éxito!</h3>
                <div className="mt-1 text-sm text-green-700">{success}</div>
                <div className="mt-2 text-xs text-green-600">Redirigiendo a transacciones...</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error al crear transacción</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de transacción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de transacción *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('INCOME')}
                className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg transition-colors ${
                  transactionType === 'INCOME'
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
                Ingreso
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('EXPENSE')}
                className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg transition-colors ${
                  transactionType === 'EXPENSE'
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
                Gasto
              </button>
            </div>
          </div>

          {/* Importe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Importe *</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">€</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0.01"
                placeholder="0,00"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Ej: Compra en supermercado"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            {loadingCategories ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                Cargando categorías...
              </div>
            ) : (
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar categoría</option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Mostrando categorías para {transactionType === 'INCOME' ? 'ingresos' : 'gastos'}
            </p>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Información adicional sobre la transacción..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || loadingCategories || !!success}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : success ? (
                '✅ Guardado'
              ) : (
                'Guardar Transacción'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 