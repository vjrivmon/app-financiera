import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

/**
 * Interfaces para análisis financiero completo
 */
interface FinancialData {
  hasData: boolean;
  transactionCount: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyTrend: Array<{
    month: string;
    income: number;
    expenses: number;
    balance: number;
  }>;
  categoryAnalysis: Array<{
    name: string;
    amount: number;
    percentage: number;
    icon: string;
    color: string;
    transactionCount: number;
  }>;
  topExpenses: Array<{
    description: string;
    amount: number;
    category: string;
    date: Date;
  }>;
  savingsRate: number;
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
  projectedAnnualSavings: number;
  spendingTrend: 'increasing' | 'decreasing' | 'stable';
  insights: string[];
}

/**
 * Obtener análisis financiero completo del usuario
 */
async function getComprehensiveFinancialData(userId: string): Promise<FinancialData | null> {
  try {
    // Buscar el usuario y su coupleId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coupleId: true }
    });

    if (!user?.coupleId) {
      return {
        hasData: false,
        transactionCount: 0,
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        monthlyTrend: [],
        categoryAnalysis: [],
        topExpenses: [],
        savingsRate: 0,
        averageMonthlyIncome: 0,
        averageMonthlyExpenses: 0,
        projectedAnnualSavings: 0,
        spendingTrend: 'stable',
        insights: []
      };
    }

    // Obtener transacciones de los últimos 12 meses
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const transactions = await prisma.transaction.findMany({
      where: {
        coupleId: user.coupleId,
        date: { gte: twelveMonthsAgo }
      },
      include: {
        category: {
          select: {
            name: true,
            icon: true,
            color: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    if (transactions.length === 0) {
      return {
        hasData: false,
        transactionCount: 0,
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        monthlyTrend: [],
        categoryAnalysis: [],
        topExpenses: [],
        savingsRate: 0,
        averageMonthlyIncome: 0,
        averageMonthlyExpenses: 0,
        projectedAnnualSavings: 0,
        spendingTrend: 'stable',
        insights: []
      };
    }

    // Calcular totales
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpenses;

    // Análisis por categorías (solo gastos)
    const expensesByCategory = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => {
        const category = t.category?.name || 'Sin categoría';
        const key = category;
        if (!acc[key]) {
          acc[key] = {
            name: category,
            amount: 0,
            icon: t.category?.icon || '📦',
            color: t.category?.color || '#6B7280',
            transactionCount: 0
          };
        }
        acc[key].amount += Number(t.amount);
        acc[key].transactionCount += 1;
        return acc;
      }, {} as Record<string, any>);

    const categoryAnalysis = Object.values(expensesByCategory)
      .map((cat: any) => ({
        ...cat,
        percentage: totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0
      }))
      .sort((a: any, b: any) => b.amount - a.amount);

    // Top gastos
    const topExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 5)
      .map(t => ({
        description: t.description,
        amount: Number(t.amount),
        category: t.category?.name || 'Sin categoría',
        date: t.date
      }));

    // Tendencia mensual (últimos 6 meses)
    const monthlyData = new Map<string, { income: number; expenses: number }>();
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().substring(0, 7); // YYYY-MM
      monthlyData.set(monthKey, { income: 0, expenses: 0 });
    }

    transactions.forEach(t => {
      const monthKey = t.date.toISOString().substring(0, 7);
      const data = monthlyData.get(monthKey);
      if (data) {
        if (t.type === 'INCOME') {
          data.income += Number(t.amount);
        } else {
          data.expenses += Number(t.amount);
        }
      }
    });

    const monthlyTrend = Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      balance: data.income - data.expenses
    }));

    // Análisis predictivo
    const monthsWithData = monthlyTrend.filter(m => m.income > 0 || m.expenses > 0);
    const averageMonthlyIncome = monthsWithData.length > 0 
      ? monthsWithData.reduce((sum, m) => sum + m.income, 0) / monthsWithData.length 
      : 0;
    const averageMonthlyExpenses = monthsWithData.length > 0 
      ? monthsWithData.reduce((sum, m) => sum + m.expenses, 0) / monthsWithData.length 
      : 0;

    const savingsRate = averageMonthlyIncome > 0 
      ? ((averageMonthlyIncome - averageMonthlyExpenses) / averageMonthlyIncome) * 100 
      : 0;

    const projectedAnnualSavings = (averageMonthlyIncome - averageMonthlyExpenses) * 12;

    // Análisis de tendencia de gasto
    let spendingTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (monthsWithData.length >= 3) {
      const recentExpenses = monthsWithData.slice(-3).reduce((sum, m) => sum + m.expenses, 0) / 3;
      const olderExpenses = monthsWithData.slice(0, 3).reduce((sum, m) => sum + m.expenses, 0) / 3;
      
      if (recentExpenses > olderExpenses * 1.05) {
        spendingTrend = 'increasing';
      } else if (recentExpenses < olderExpenses * 0.95) {
        spendingTrend = 'decreasing';
      }
    }

    // Generar insights inteligentes
    const insights: string[] = [];

    if (savingsRate > 20) {
      insights.push(`¡Excelente! Tu tasa de ahorro del ${savingsRate.toFixed(1)}% está por encima del promedio.`);
    } else if (savingsRate < 10) {
      insights.push(`Tu tasa de ahorro actual es del ${savingsRate.toFixed(1)}%. Considera reducir gastos para mejorar.`);
    }

    if (categoryAnalysis.length > 0) {
      const topCategory = categoryAnalysis[0];
      if (topCategory.percentage > 40) {
        insights.push(`El ${topCategory.percentage.toFixed(1)}% de tus gastos van a ${topCategory.name}. Considera diversificar.`);
      }
    }

    if (spendingTrend === 'increasing') {
      insights.push('Tus gastos han aumentado en los últimos meses. Revisa tu presupuesto.');
    } else if (spendingTrend === 'decreasing') {
      insights.push('¡Bien! Has reducido tus gastos en los últimos meses.');
    }

    if (projectedAnnualSavings > 0) {
      insights.push(`Al ritmo actual, podrías ahorrar €${projectedAnnualSavings.toFixed(0)} este año.`);
    }

    if (insights.length === 0) {
      insights.push('Sigue registrando transacciones para obtener análisis más detallados.');
    }

    return {
      hasData: true,
      transactionCount: transactions.length,
      totalIncome,
      totalExpenses,
      balance,
      monthlyTrend,
      categoryAnalysis,
      topExpenses,
      savingsRate,
      averageMonthlyIncome,
      averageMonthlyExpenses,
      projectedAnnualSavings,
      spendingTrend,
      insights
    };

  } catch (error) {
    console.error('Error obteniendo análisis financiero:', error);
    return null;
  }
}

/**
 * Página de Análisis Financiero Completo
 */
export default async function AnalysisPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  // Obtener análisis completo
  const financialData = await getComprehensiveFinancialData(session.user.id);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header de página */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Análisis Financiero</h1>
        <p className="text-gray-600 mt-2">
          {financialData?.hasData 
            ? `Análisis detallado de ${financialData.transactionCount} transacciones`
            : 'Gráficos y reportes de tus finanzas'
          }
        </p>
      </div>

      {/* Contenido principal */}
      {financialData?.hasData ? (
        /* Usuario con datos - Mostrar análisis completo */
        <div className="space-y-8">
          {/* KPIs principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-green-600">
                    €{financialData.totalIncome.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Gastos Totales</p>
                  <p className="text-2xl font-bold text-red-600">
                    €{financialData.totalExpenses.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Balance</p>
                  <p className={`text-2xl font-bold ${financialData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    €{financialData.balance.toFixed(2)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  financialData.balance >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <svg className={`w-6 h-6 ${financialData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Tasa de Ahorro</p>
                  <p className={`text-2xl font-bold ${financialData.savingsRate >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {financialData.savingsRate.toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos e insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tendencia mensual */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📈 Tendencia Mensual</h3>
              
              {/* Gráfico simplificado con barras */}
              <div className="space-y-4">
                {financialData.monthlyTrend.map((month, index) => {
                  const maxAmount = Math.max(
                    ...financialData.monthlyTrend.map(m => Math.max(m.income, m.expenses))
                  );
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          {new Date(month.month + '-01').toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'short' 
                          })}
                        </span>
                        <span className={`font-semibold ${
                          month.balance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          €{month.balance.toFixed(0)}
                        </span>
                      </div>
                      
                      {/* Barras de ingresos y gastos */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-12 text-xs text-green-600">Ingresos</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: maxAmount > 0 ? `${(month.income / maxAmount) * 100}%` : '0%' }}
                            ></div>
                          </div>
                          <div className="w-16 text-xs text-gray-600">€{month.income.toFixed(0)}</div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="w-12 text-xs text-red-600">Gastos</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full transition-all"
                              style={{ width: maxAmount > 0 ? `${(month.expenses / maxAmount) * 100}%` : '0%' }}
                            ></div>
                          </div>
                          <div className="w-16 text-xs text-gray-600">€{month.expenses.toFixed(0)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Análisis predictivo */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🔮 Análisis Predictivo</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Proyección Anual</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    €{financialData.projectedAnnualSavings.toFixed(0)}
                  </p>
                  <p className="text-sm text-blue-700">Ahorro proyectado</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Promedio Mensual</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Ingresos:</span>
                      <span className="font-semibold text-green-600">€{financialData.averageMonthlyIncome.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Gastos:</span>
                      <span className="font-semibold text-red-600">€{financialData.averageMonthlyExpenses.toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                <div className={`border rounded-lg p-4 ${
                  financialData.spendingTrend === 'increasing' ? 'bg-red-50 border-red-200' :
                  financialData.spendingTrend === 'decreasing' ? 'bg-green-50 border-green-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    financialData.spendingTrend === 'increasing' ? 'text-red-900' :
                    financialData.spendingTrend === 'decreasing' ? 'text-green-900' :
                    'text-gray-900'
                  }`}>
                    Tendencia de Gasto
                  </h4>
                  <p className={`text-sm ${
                    financialData.spendingTrend === 'increasing' ? 'text-red-700' :
                    financialData.spendingTrend === 'decreasing' ? 'text-green-700' :
                    'text-gray-700'
                  }`}>
                    {financialData.spendingTrend === 'increasing' && '📈 Aumentando'}
                    {financialData.spendingTrend === 'decreasing' && '📉 Disminuyendo'}
                    {financialData.spendingTrend === 'stable' && '📊 Estable'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Análisis por categorías y insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gastos por categoría */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Gastos por Categoría</h3>
              
              <div className="space-y-4">
                {financialData.categoryAnalysis.slice(0, 6).map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{category.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        <p className="text-sm text-gray-500">{category.transactionCount} transacciones</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">€{category.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights inteligentes */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">💡 Insights Inteligentes</h3>
              
              <div className="space-y-3">
                {financialData.insights.map((insight, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">{insight}</p>
                  </div>
                ))}
              </div>

              {/* Recomendaciones */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">🎯 Recomendaciones</h4>
                <div className="space-y-2">
                  {financialData.savingsRate < 20 && (
                    <div className="flex items-start space-x-2 text-sm">
                      <span className="text-yellow-500">⚠️</span>
                      <span className="text-gray-700">Intenta ahorrar al menos el 20% de tus ingresos</span>
                    </div>
                  )}
                  {financialData.categoryAnalysis.length > 0 && financialData.categoryAnalysis[0]?.percentage > 35 && (
                    <div className="flex items-start space-x-2 text-sm">
                      <span className="text-blue-500">💡</span>
                      <span className="text-gray-700">Diversifica tus gastos para mejor control financiero</span>
                    </div>
                  )}
                  <div className="flex items-start space-x-2 text-sm">
                    <span className="text-green-500">✅</span>
                    <span className="text-gray-700">Revisa tus gastos semanalmente para mantener el control</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reportes personalizados */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">📄 Reportes Personalizados</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    📊
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Reporte Mensual</h4>
                    <p className="text-sm text-gray-600">Análisis del mes actual</p>
                  </div>
                </div>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                  Generar Reporte
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    📈
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Reporte Anual</h4>
                    <p className="text-sm text-gray-600">Resumen de todo el año</p>
                  </div>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                  Generar Reporte
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    🎯
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Reporte de Objetivos</h4>
                    <p className="text-sm text-gray-600">Progreso hacia metas</p>
                  </div>
                </div>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                  Generar Reporte
                </button>
              </div>
            </div>
          </div>

          {/* Top gastos */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">💸 Mayores Gastos</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Importe
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {financialData.topExpenses.map((expense, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.date.toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                        €{expense.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link 
              href="/dashboard/transactions/new"
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-medium transition-colors text-center"
            >
              + Nueva Transacción
            </Link>
            <Link 
              href="/dashboard/goals/new"
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-medium transition-colors text-center"
            >
              + Nuevo Objetivo
            </Link>
            <Link 
              href="/dashboard/chat"
              className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg font-medium transition-colors text-center"
            >
              🤖 Consultar IA
            </Link>
            <Link 
              href="/dashboard/analysis/tutorial"
              className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-lg font-medium transition-colors text-center"
            >
              📚 Ver Tutorial
            </Link>
          </div>
        </div>
      ) : (
        /* Usuario sin datos - Estado vacío con tutorial */
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
              />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sin datos para analizar
          </h3>
          
          <p className="text-gray-500 mb-6">
            Una vez que tengas transacciones, aquí verás gráficos y análisis detallados de tus finanzas.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/dashboard/transactions/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Primera Transacción
            </Link>
            
            <Link 
              href="/dashboard/analysis/tutorial"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Ver Tutorial
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 