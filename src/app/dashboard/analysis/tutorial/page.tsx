import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

/**
 * Página de Tutorial de Análisis Financiero
 */
export default async function AnalysisTutorialPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  const tutorialSteps = [
    {
      title: "1. Registra tus transacciones",
      description: "Comienza agregando tus ingresos y gastos diarios para tener datos que analizar.",
      icon: "💰",
      action: "Ir a Transacciones",
      link: "/dashboard/transactions/new"
    },
    {
      title: "2. Categoriza correctamente",
      description: "Asigna categorías específicas a cada transacción para análisis más precisos.",
      icon: "🏷️",
      action: "Ver Categorías",
      link: "/dashboard/transactions"
    },
    {
      title: "3. Define tus objetivos",
      description: "Establece metas de ahorro para visualizar tu progreso en los análisis.",
      icon: "🎯",
      action: "Crear Objetivo",
      link: "/dashboard/goals/new"
    },
    {
      title: "4. Consulta reportes",
      description: "Una vez tengas datos, verás gráficos de tendencias, gastos por categoría y más.",
      icon: "📊",
      action: "Ver Análisis",
      link: "/dashboard/analysis"
    }
  ];

  const features = [
    {
      name: "Gráficos de Tendencias",
      description: "Visualiza la evolución de tus ingresos y gastos a lo largo del tiempo"
    },
    {
      name: "Análisis por Categorías",
      description: "Descubre en qué áreas gastas más dinero con gráficos circulares"
    },
    {
      name: "Reportes Mensuales",
      description: "Compara tus finanzas mes a mes para identificar patrones"
    },
    {
      name: "Presupuestos vs Real",
      description: "Compara lo que planificaste gastar con lo que realmente gastaste"
    },
    {
      name: "Proyecciones de Ahorro",
      description: "Calcula cuándo alcanzarás tus objetivos según tu ritmo actual"
    },
    {
      name: "Alertas Inteligentes",
      description: "Recibe notificaciones cuando te acerques a límites de gasto"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/dashboard/analysis"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al Análisis
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Tutorial de Análisis Financiero</h1>
        <p className="text-gray-600 mt-2">
          Aprende a utilizar las herramientas de análisis para tomar mejores decisiones financieras
        </p>
      </div>

      {/* Pasos del tutorial */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Primeros pasos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutorialSteps.map((step, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{step.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <Link
                    href={step.link}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    {step.action}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Características disponibles */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Características del Análisis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {feature.name}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Consejos */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-blue-900 mb-4">💡 Consejos para mejores análisis</h2>
        <ul className="space-y-3 text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Registra todas las transacciones, incluso las pequeñas, para tener datos completos</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Usa categorías consistentes para poder comparar gastos entre períodos</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Revisa tus análisis semanalmente para detectar tendencias temprano</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Establece alertas de gastos para mantenerte dentro del presupuesto</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Usa el asistente IA para obtener consejos personalizados sobre tus finanzas</span>
          </li>
        </ul>
      </div>

      {/* Call to action */}
      <div className="text-center">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            ¿Listo para empezar?
          </h3>
          <p className="text-gray-600 mb-6">
            Comienza registrando tu primera transacción y construye tu perfil financiero
          </p>
          <div className="space-x-4">
            <Link
              href="/dashboard/transactions/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Primera Transacción
            </Link>
            <Link
              href="/dashboard/chat"
              className="inline-flex items-center px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
            >
              Consultar IA
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 