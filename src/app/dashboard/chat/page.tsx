'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: string;
    type: 'navigate' | 'external';
  }>;
}

/**
 * Página del Asistente IA con chat funcional mejorado
 */
export default function ChatPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Estado del chat con persistencia
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Cargar estado persistente del chat
  useEffect(() => {
    const savedMessages = localStorage.getItem('budgetchat_messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Convertir timestamps string a Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Error loading saved messages:', error);
      }
          } else {
      // Mensaje de bienvenida inicial
      const welcomeMessage: Message = {
        id: 'welcome-' + Date.now(),
        content: `¡Hola ${session?.user?.name?.split(' ')[0] || 'Usuario'}! 👋 Soy tu asistente financiero personal. Puedo ayudarte con:\n\n• 📊 Análisis de tus finanzas\n• 💰 Consejos de ahorro\n• 🎯 Planificación de objetivos\n• 📱 Navegación por la aplicación\n\n¿En qué puedo ayudarte hoy?`,
        sender: 'assistant',
        timestamp: new Date(),
        actions: [
          { label: 'Ver mis transacciones', action: '/dashboard/transactions', type: 'navigate' },
          { label: 'Crear objetivo de ahorro', action: '/dashboard/goals/new', type: 'navigate' },
          { label: 'Planificar calendario', action: '/dashboard/calendar', type: 'navigate' },
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [session]);

  // Guardar estado del chat
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('budgetchat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll a los mensajes más recientes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Función para enviar mensaje mejorada
  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || inputValue.trim();
    if (!content || isLoading) {
      return;
    }

    // Crear mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Preparar contexto del usuario
      const userContext = {
        name: session?.user?.name,
        email: session?.user?.email,
        hasProfile: !!session?.user,
        currentPage: '/dashboard/chat',
        // Agregar más contexto aquí en el futuro
      };

      // Transformar mensajes para la API (mapear 'sender' a 'role')
      const apiConversationHistory = messages.slice(-5).map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

      // Llamar a la API del chatbot con contexto
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content,
          context: userContext,
          conversationHistory: apiConversationHistory // Usar historial transformado
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();

      // Detectar si el mensaje contiene sugerencias de navegación
      const assistantResponse = data.response || 'Lo siento, no pude procesar tu consulta.';
      const actions = detectNavigationActions(assistantResponse);

      // Crear mensaje del asistente
      const assistantMessage: Message = {
        id: Date.now().toString() + '-assistant',
        content: assistantResponse,
        sender: 'assistant',
        timestamp: new Date(),
        ...(actions.length > 0 && { actions }),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      
      // Mensaje de error
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        content: '❌ Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.',
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Detectar acciones de navegación en la respuesta
  const detectNavigationActions = (response: string): Array<{label: string, action: string, type: 'navigate' | 'external'}> => {
    const actions = [];
    
    if (response.toLowerCase().includes('transacci')) {
      actions.push({ label: 'Ir a Transacciones', action: '/dashboard/transactions', type: 'navigate' as const });
    }
    if (response.toLowerCase().includes('objetivo') || response.toLowerCase().includes('ahorro')) {
      actions.push({ label: 'Crear Objetivo', action: '/dashboard/goals/new', type: 'navigate' as const });
    }
    if (response.toLowerCase().includes('análisis') || response.toLowerCase().includes('gráfico')) {
      actions.push({ label: 'Ver Análisis', action: '/dashboard/analysis', type: 'navigate' as const });
    }
    if (response.toLowerCase().includes('calendario')) {
      actions.push({ label: 'Abrir Calendario', action: '/dashboard/calendar', type: 'navigate' as const });
    }
    
    return actions;
  };

  // Manejar acciones de navegación
  const handleActionClick = (action: string, type: 'navigate' | 'external') => {
    if (type === 'navigate') {
      router.push(action);
    } else {
      window.open(action, '_blank');
    }
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  // Limpiar conversación
  const handleClearChat = () => {
    if (confirm('¿Estás seguro de que quieres limpiar la conversación?')) {
      setMessages([]);
      localStorage.removeItem('budgetchat_messages');
    }
  };

  // Sugerencias rápidas inteligentes
  const smartSuggestions = [
    '¿Cómo crear un presupuesto para parejas?',
    'Llévame a crear una nueva transacción',
    'Análisis de mis gastos del mes',
    'Consejos para ahorrar más dinero',
    'Configurar objetivos de ahorro',
    '¿Qué funciones tiene el calendario?',
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header de página */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Asistente IA</h1>
            <p className="text-gray-600 mt-2">Tu consejero financiero personal con contexto completo</p>
          </div>
          <button
            onClick={handleClearChat}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Limpiar chat
          </button>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-lg border border-gray-200 h-[700px] flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg 
                  className="w-6 h-6 text-blue-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">FinanceBot Pro</h3>
                <p className="text-sm text-gray-500">
                  En línea • Conoce tu perfil • {messages.length} mensajes
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Estado guardado automáticamente
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg 
                  className="w-8 h-8 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                  />
                </svg>
              </div>
              <p className="text-gray-500">Cargando tu asistente personalizado...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-l-lg rounded-tr-lg'
                      : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg'
                  } px-4 py-3`}>
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    
                    {/* Botones de acción */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => handleActionClick(action.action, action.type)}
                            className="block w-full text-left px-3 py-2 text-xs bg-white text-gray-700 rounded border hover:bg-gray-50 transition-colors"
                          >
                            {action.label} →
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <p className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-r-lg rounded-tl-lg">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">Analizando tu consulta...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Quick Suggestions */}
        {messages.length <= 1 && (
          <div className="border-t border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-3">Sugerencias inteligentes:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {smartSuggestions.slice(0, 4).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(suggestion)}
                  className="text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Pregúntame sobre finanzas, navegación, consejos..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
            >
              {isLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Enviar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 