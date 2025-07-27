'use client';

import { useState, useEffect } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'income' | 'expense' | 'reminder' | 'goal';
  amount?: number;
  date: Date;
  description?: string;
}

/**
 * Página de Calendario Financiero con persistencia real
 */
export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    amount: '',
  });

  // Cargar eventos del mes actual al iniciar
  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  /**
   * Cargar eventos desde la API
   */
  const loadEvents = async () => {
    try {
      setLoading(true);
      const month = currentDate.getMonth() + 1; // JavaScript months are 0-based
      const year = currentDate.getFullYear();
      
      console.log(`📅 Cargando eventos para ${month}/${year}`);
      
      const response = await fetch(`/api/calendar?month=${month}&year=${year}`);
      const result = await response.json();

      if (result.success) {
        // Convertir fechas de string a Date objects
        const eventsWithDates = result.events.map((event: any) => ({
          ...event,
          date: new Date(event.date)
        }));
        
        setEvents(eventsWithDates);
        console.log(`✅ ${eventsWithDates.length} eventos cargados desde BD`);
      } else {
        console.error('❌ Error cargando eventos:', result.error);
      }
    } catch (error) {
      console.error('❌ Error cargando eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener días del mes actual
   */
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Días del mes anterior para completar la primera semana
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Días del siguiente mes para completar la última semana
    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let day = 1; days.length < totalCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  };

  /**
   * Navegar entre meses
   */
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  /**
   * Verificar si una fecha es hoy
   */
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  /**
   * Verificar si una fecha está seleccionada
   */
  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  /**
   * Manejar clic en una fecha
   */
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowEventModal(true);
  };

  /**
   * Obtener eventos para una fecha específica
   */
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  /**
   * Obtener color del evento según tipo
   */
  const getEventColor = (type: string) => {
    switch (type) {
      case 'income': return 'bg-green-500';
      case 'expense': return 'bg-red-500';
      case 'reminder': return 'bg-blue-500';
      case 'goal': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  /**
   * Obtener icono del evento según tipo
   */
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'income': return '💰';
      case 'expense': return '💸';
      case 'reminder': return '⏰';
      case 'goal': return '🎯';
      default: return '📅';
    }
  };

  /**
   * Manejar cambios en el formulario
   */
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Crear nuevo evento con persistencia real
   */
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.type || !selectedDate) {
      alert('Por favor, completa todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      const eventData = {
        title: formData.title,
        type: formData.type as 'income' | 'expense' | 'reminder' | 'goal',
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        date: selectedDate.toISOString(),
        description: '',
      };

      console.log('📅 Enviando evento a API:', eventData);

      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear el evento');
      }

      console.log('✅ Evento creado exitosamente:', result);

      // Añadir el evento al estado local
      const newEvent: CalendarEvent = {
        id: result.event.id,
        title: formData.title,
        type: formData.type as 'income' | 'expense' | 'reminder' | 'goal',
        ...(formData.amount && { amount: parseFloat(formData.amount) }),
        date: selectedDate,
      };

      setEvents(prev => [...prev, newEvent]);
      setShowEventModal(false);
      setFormData({ title: '', type: '', amount: '' });
      
      alert(`✅ ${result.message}`);

    } catch (error) {
      console.error('❌ Error creando evento:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const days = getDaysInMonth();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h1>
          <p className="text-gray-600 mt-2">
            Planifica tus finanzas y eventos importantes
            {events.length > 0 && ` • ${events.length} evento${events.length !== 1 ? 's' : ''} este mes`}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors"
              disabled={loading}
            >
              Hoy
            </button>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedDate(new Date());
              setShowEventModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            disabled={loading}
          >
            + Nuevo Evento
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <svg className="animate-spin h-5 w-5 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-blue-800 text-sm">Cargando eventos...</span>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="p-4 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {days.map((dayInfo, index) => {
            const dayEvents = getEventsForDate(dayInfo.date);
            
            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-b border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !dayInfo.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                } ${isToday(dayInfo.date) ? 'bg-blue-50' : ''} ${
                  isSelected(dayInfo.date) ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => dayInfo.isCurrentMonth && handleDateClick(dayInfo.date)}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday(dayInfo.date) ? 'text-blue-600' : ''
                }`}>
                  {dayInfo.date.getDate()}
                </div>
                
                {/* Events for this day */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs px-2 py-1 rounded text-white truncate ${getEventColor(event.type)}`}
                      title={`${getEventIcon(event.type)} ${event.title}${event.amount ? ` €${event.amount}` : ''}`}
                    >
                      {getEventIcon(event.type)} {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{dayEvents.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Crear Evento {selectedDate && `- ${selectedDate.toLocaleDateString('es-ES')}`}
            </h3>
            
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del evento *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Pago de alquiler, Cobro de nómina..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de evento *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="income">💰 Ingreso</option>
                  <option value="expense">💸 Gasto</option>
                  <option value="reminder">⏰ Recordatorio</option>
                  <option value="goal">🎯 Meta de ahorro</option>
                </select>
              </div>

              {(formData.type === 'income' || formData.type === 'expense') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Importe (opcional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">€</span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEventModal(false);
                    setFormData({ title: '', type: '', amount: '' });
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    'Crear Evento'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 