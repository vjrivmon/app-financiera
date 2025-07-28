import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { chatMessageSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

let openai: any = null;
if (process.env.OPENAI_API_KEY) {
  try {
    const OpenAI = require('openai');
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } catch (error) {
    console.warn('⚠️ OpenAI no disponible:', error);
  }
}

/**
 * Obtener contexto financiero COMPLETO del usuario - Versión Empresarial
 * Incluye TODA la información disponible para máxima personalización del chatbot
 */
async function getComprehensiveUserContext(userId: string) {
  try {
    // 1. INFORMACIÓN BÁSICA DEL USUARIO Y PAREJA
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        name: true, 
        email: true, 
        emailVerified: true,
        avatar: true,
        coupleId: true,
        createdAt: true
      }
    });

    if (!user) {
      return {
        hasData: false,
        summary: 'Usuario no encontrado',
        insights: []
      };
    }

    // 2. CONFIGURACIONES PERSONALES DEL USUARIO
    const userSettings = await prisma.userSettings.findFirst({
      where: { userId: userId }
    });

    // 3. INFORMACIÓN DE LA PAREJA (si existe)
    let coupleProfile = null;
    let sharedSettings = null;
    let partner = null;
    
    if (user.coupleId) {
      coupleProfile = await prisma.coupleProfile.findUnique({
        where: { id: user.coupleId },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          sharedSettings: true
        }
      });

      if (coupleProfile?.sharedSettings) {
        sharedSettings = coupleProfile.sharedSettings;
      }
      
      if (coupleProfile?.users) {
        partner = coupleProfile.users.find(u => u.id !== userId);
      }
    }

    if (!user.coupleId) {
      return {
        hasData: false,
        user: user,
        userSettings,
        summary: 'Usuario sin datos financieros configurados',
        insights: ['💡 Configura tu perfil de pareja para comenzar a gestionar finanzas conjuntas']
      };
    }

    // 4. ANÁLISIS TEMPORAL DETALLADO
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // 5. TRANSACCIONES COMPLETAS CON ANÁLISIS PROFUNDO
    const allTransactions = await prisma.transaction.findMany({
      where: { coupleId: user.coupleId },
      include: {
        category: { 
          select: { 
            name: true, 
            icon: true, 
            color: true, 
            type: true, 
            isDefault: true 
          } 
        },
        user: { select: { name: true, id: true } }
      },
      orderBy: { date: 'desc' },
      take: 200 // Últimas 200 transacciones para análisis completo
    });

    // Transacciones por períodos
    const monthlyTransactions = allTransactions.filter(t => 
      new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth
    );
    
    const lastMonthTransactions = allTransactions.filter(t => 
      new Date(t.date) >= startOfLastMonth && new Date(t.date) <= endOfLastMonth
    );

    const yearlyTransactions = allTransactions.filter(t => 
      new Date(t.date) >= startOfYear
    );

    // 6. CATEGORÍAS PERSONALIZADAS
    const categories = await prisma.category.findMany({
      where: { coupleId: user.coupleId },
      orderBy: { name: 'asc' }
    });

    // 7. OBJETIVOS DE AHORRO CON PROGRESO DETALLADO
    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { coupleId: user.coupleId },
      orderBy: { createdAt: 'desc' }
    });

    // Calcular progreso detallado de objetivos
    const goalsWithProgress = savingsGoals.map(goal => {
      const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
      const isCompleted = Number(goal.currentAmount) >= Number(goal.targetAmount);
      const amountNeeded = Number(goal.targetAmount) - Number(goal.currentAmount);
      
      // Calcular tiempo estimado para completar (basado en ahorros promedio)
      const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const monthlySavings = monthlyIncome - monthlyExpenses;
      
      const monthsToComplete = monthlySavings > 0 ? Math.ceil(amountNeeded / monthlySavings) : null;
      
      return {
        ...goal,
        progress,
        isCompleted,
        amountNeeded,
        monthsToComplete,
        priorityText: goal.priority === 'HIGH' ? 'Alta' : goal.priority === 'MEDIUM' ? 'Media' : 'Baja'
      };
    });

    // 8. EVENTOS DE CALENDARIO
    const calendarEvents = await prisma.recurringTransaction.findMany({
      where: { coupleId: user.coupleId },
      orderBy: { startDate: 'desc' },
      take: 20
    });

    // 9. CÁLCULOS FINANCIEROS DETALLADOS
    
    // Totales mensuales
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalBalance = monthlyIncome - monthlyExpenses;

    // Comparación con mes anterior
    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const incomeChange = monthlyIncome - lastMonthIncome;
    const expenseChange = monthlyExpenses - lastMonthExpenses;

    // Totales anuales
    const yearlyIncome = yearlyTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const yearlyExpenses = yearlyTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // 10. ANÁLISIS POR CATEGORÍAS DETALLADO
    const expensesByCategory = monthlyTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => {
        const categoryName = t.category.name;
        if (!acc[categoryName]) {
          acc[categoryName] = {
            amount: 0,
            count: 0,
            icon: t.category.icon,
            color: t.category.color,
            transactions: []
          };
        }
        acc[categoryName].amount += Number(t.amount);
        acc[categoryName].count += 1;
        acc[categoryName].transactions.push(t);
        return acc;
      }, {} as Record<string, any>);

    const categoryAnalysis = Object.entries(expensesByCategory)
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: (data.amount / monthlyExpenses) * 100,
        avgTransaction: data.amount / data.count,
        icon: data.icon,
        color: data.color,
        topExpense: data.transactions.sort((a: any, b: any) => Number(b.amount) - Number(a.amount))[0]
      }))
      .sort((a, b) => b.amount - a.amount);

    // 11. PATRONES DE GASTO INTELIGENTES
    const spendingPatterns = {
      mostExpensiveDay: null as any,
      averageTransactionSize: allTransactions.length > 0 ? 
        allTransactions.reduce((sum, t) => sum + Number(t.amount), 0) / allTransactions.length : 0,
      frequentMerchants: {} as Record<string, number>,
      weeklyPattern: Array(7).fill(0),
      monthlyPattern: Array(31).fill(0)
    };

    // Analizar patrones por día de la semana
    allTransactions.forEach(t => {
      const dayOfWeek = new Date(t.date).getDay();
      spendingPatterns.weeklyPattern[dayOfWeek] += Number(t.amount);
      
      const dayOfMonth = new Date(t.date).getDate() - 1;
      if (dayOfMonth < 31) {
        spendingPatterns.monthlyPattern[dayOfMonth] += Number(t.amount);
      }
    });

    // 12. INSIGHTS FINANCIEROS AVANZADOS
    const insights = [];
    
    // Balance analysis
    if (totalBalance > 0) {
      insights.push(`💚 Excelente: Tienes un balance positivo de €${totalBalance.toFixed(2)} este mes`);
    } else if (totalBalance < 0) {
      insights.push(`⚠️ Atención: Estás gastando €${Math.abs(totalBalance).toFixed(2)} más de lo que ingresas este mes`);
    } else {
      insights.push(`⚖️ Balance equilibrado: Tus ingresos y gastos están igualados este mes`);
    }

    // Income/Expense trends
    if (incomeChange > 0) {
      insights.push(`📈 Tus ingresos aumentaron €${incomeChange.toFixed(2)} respecto al mes pasado`);
    } else if (incomeChange < 0) {
      insights.push(`📉 Tus ingresos disminuyeron €${Math.abs(incomeChange).toFixed(2)} respecto al mes pasado`);
    }

    if (expenseChange > 0) {
      insights.push(`📊 Tus gastos aumentaron €${expenseChange.toFixed(2)} respecto al mes pasado`);
    } else if (expenseChange < 0) {
      insights.push(`📊 Has reducido gastos en €${Math.abs(expenseChange).toFixed(2)} respecto al mes pasado`);
    }

    // Category insights
    if (categoryAnalysis.length > 0) {
      const topCategory = categoryAnalysis[0];
      if (topCategory) {
        insights.push(`🔝 Tu mayor gasto es en ${topCategory.category}: €${topCategory.amount.toFixed(2)} (${topCategory.percentage.toFixed(1)}%)`);
      }
      
      if (categoryAnalysis.length > 1) {
        const secondCategory = categoryAnalysis[1];
        if (secondCategory) {
          insights.push(`📊 Tu segundo mayor gasto es ${secondCategory.category}: €${secondCategory.amount.toFixed(2)}`);
        }
      }
    }

    // Goals insights
    if (goalsWithProgress.length > 0) {
      const completedGoals = goalsWithProgress.filter(g => g.isCompleted);
      const activeGoals = goalsWithProgress.filter(g => !g.isCompleted);
      
      if (completedGoals.length > 0) {
        insights.push(`🎉 ¡Felicidades! Has completado ${completedGoals.length} objetivo${completedGoals.length > 1 ? 's' : ''} de ahorro`);
      }
      
      if (activeGoals.length > 0) {
        const closestGoal = activeGoals.sort((a, b) => b.progress - a.progress)[0];
        if (closestGoal && closestGoal.progress > 0) {
          insights.push(`🎯 Tu objetivo más avanzado es "${closestGoal.name}" con ${closestGoal.progress.toFixed(1)}% completado`);
          if (closestGoal.monthsToComplete) {
            insights.push(`⏱️ Al ritmo actual, completarás "${closestGoal.name}" en ${closestGoal.monthsToComplete} mes${closestGoal.monthsToComplete > 1 ? 'es' : ''}`);
          }
        }
      }
    }

    // Partner insights
    if (partner) {
      const userTransactions = monthlyTransactions.filter(t => t.user.id === userId);
      const partnerTransactions = monthlyTransactions.filter(t => t.user.id === partner.id);
      
      if (userTransactions.length > 0 && partnerTransactions.length > 0) {
        const userTotal = userTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const partnerTotal = partnerTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
        
        if (userTotal > partnerTotal) {
          insights.push(`👥 Has registrado más transacciones que ${partner.name} este mes (€${userTotal.toFixed(2)} vs €${partnerTotal.toFixed(2)})`);
        } else if (partnerTotal > userTotal) {
          insights.push(`👥 ${partner.name} ha registrado más transacciones que tú este mes (€${partnerTotal.toFixed(2)} vs €${userTotal.toFixed(2)})`);
        }
      }
    }

    // Calendar insights
    if (calendarEvents.length > 0) {
      const upcomingEvents = calendarEvents.filter(e => new Date(e.startDate) > now);
      if (upcomingEvents.length > 0) {
        insights.push(`📅 Tienes ${upcomingEvents.length} evento${upcomingEvents.length > 1 ? 's' : ''} financiero${upcomingEvents.length > 1 ? 's' : ''} próximo${upcomingEvents.length > 1 ? 's' : ''} en tu calendario`);
      }
    }

    // 13. RETORNO DE CONTEXTO COMPLETO
    return {
      hasData: true,
      user: {
        ...user,
        daysSinceRegistration: Math.floor((now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      },
      userSettings,
      partner,
      coupleProfile,
      sharedSettings,
      financial: {
        // Datos mensuales
        monthlyIncome,
        monthlyExpenses,
        totalBalance,
        
        // Comparación mensual
        lastMonthIncome,
        lastMonthExpenses,
        incomeChange,
        expenseChange,
        
        // Datos anuales
        yearlyIncome,
        yearlyExpenses,
        yearlyBalance: yearlyIncome - yearlyExpenses,
        
        // Contadores
        transactionCount: allTransactions.length,
        monthlyTransactionCount: monthlyTransactions.length,
        
        // Análisis por categorías
        categoryAnalysis,
        topExpenseCategory: categoryAnalysis[0],
        
        // Patrones
        spendingPatterns,
        averageTransactionSize: spendingPatterns.averageTransactionSize
      },
      goals: {
        total: savingsGoals.length,
        completed: goalsWithProgress.filter(g => g.isCompleted).length,
        active: goalsWithProgress.filter(g => !g.isCompleted).length,
        details: goalsWithProgress,
        totalTargetAmount: savingsGoals.reduce((sum, g) => sum + Number(g.targetAmount), 0),
        totalCurrentAmount: savingsGoals.reduce((sum, g) => sum + Number(g.currentAmount), 0),
        totalProgress: savingsGoals.length > 0 ? 
          (savingsGoals.reduce((sum, g) => sum + Number(g.currentAmount), 0) / 
           savingsGoals.reduce((sum, g) => sum + Number(g.targetAmount), 0)) * 100 : 0
      },
      categories: {
        total: categories.length,
        custom: categories.filter(c => !c.isDefault).length,
        income: categories.filter(c => c.type === 'INCOME').length,
        expense: categories.filter(c => c.type === 'EXPENSE').length,
        details: categories
      },
      calendar: {
        totalEvents: calendarEvents.length,
        upcomingEvents: calendarEvents.filter(e => new Date(e.startDate) > now).length,
        details: calendarEvents.slice(0, 10) // Últimos 10 eventos
      },
      recentTransactions: allTransactions.slice(0, 10),
      insights,
      summary: `Usuario ${user.name} con ${allTransactions.length} transacciones, ${savingsGoals.length} objetivos, balance mensual: €${totalBalance.toFixed(2)}. ${partner ? `En pareja con ${partner.name}` : 'Sin pareja configurada'}.`
    };

  } catch (error) {
    console.error('❌ Error obteniendo contexto del usuario:', error);
    return {
      hasData: false,
      summary: 'Error al obtener datos financieros',
      insights: ['🚨 Hubo un error al cargar tu información financiera. Por favor, contacta soporte.']
    };
  }
}

/**
 * Construir prompt mejorado para el asistente financiero con contexto COMPLETO
 * Incluye TODA la información disponible del usuario para respuestas personalizadas
 */
function buildEnhancedFinancialAssistantPrompt(userContext: any) {
  const basePrompt = `Eres FinanceBot Pro, el asistente de inteligencia artificial más avanzado de Budget Couple App. 

PERSONALIDAD Y ESTILO:
- Profesional pero cercano, con empatía financiera
- Usas emojis relevantes ocasionalmente para hacer las respuestas más amigables
- Das consejos prácticos y específicos basados en los datos reales del usuario
- Siempres positivo y motivador, pero realista sobre la situación financiera
- Puedes navegar por toda la aplicación y conoces cada funcionalidad

CONOCIMIENTO COMPLETO DE LA APLICACIÓN:
- Dashboard principal: /dashboard
- Transacciones: /dashboard/transactions (ver todas) y /dashboard/transactions/new (crear nueva)
- Análisis: /dashboard/analysis (gráficos y reportes)
- Objetivos: /dashboard/goals (gestión) y /dashboard/goals/new (crear nuevo)
- Calendario: /dashboard/calendar (eventos financieros)
- Configuración: /dashboard/settings
- Perfil: /dashboard/profile
- Chat IA: /dashboard/chat

CAPACIDADES:
✅ Analizar patrones de gasto y sugerir optimizaciones
✅ Calcular proyecciones de ahorro y tiempo para objetivos
✅ Comparar períodos financieros (mes actual vs anterior)
✅ Analizar gastos por categorías con porcentajes
✅ Dar consejos específicos de pareja sobre finanzas
✅ Sugerir navegación a secciones relevantes de la app
✅ Crear análisis financieros personalizados
✅ Detectar tendencias y oportunidades de mejora`;

  if (!userContext.hasData) {
    return basePrompt + `

❌ ESTADO ACTUAL: Usuario sin datos financieros
- Usuario: ${userContext.user?.name || 'Usuario'} (${userContext.user?.email || 'Email no disponible'})
- Tiempo en la app: ${userContext.user?.daysSinceRegistration || 0} días
- Estado: ${userContext.summary}

RECOMENDACIONES INMEDIATAS:
1. Configurar perfil de pareja si no lo tiene
2. Crear primera transacción para comenzar el análisis
3. Establecer primer objetivo de ahorro
4. Explorar las funcionalidades de la app

Enfócate en orientar al usuario para que comience a usar la aplicación.`;
  }

  return basePrompt + `

🏆 PERFIL COMPLETO DEL USUARIO:
👤 Usuario: ${userContext.user?.name || 'Usuario'} (registrado hace ${userContext.user?.daysSinceRegistration || 0} días)
📧 Email: ${userContext.user?.email}
${userContext.partner ? `💑 Pareja: ${userContext.partner.name}` : '💔 Sin pareja configurada'}
${userContext.coupleProfile ? `👨‍👩‍👧‍👦 Perfil pareja: "${userContext.coupleProfile.name}"` : ''}

⚙️ CONFIGURACIONES PERSONALES:
${userContext.userSettings ? `
- Tema: ${userContext.userSettings.theme}
- Idioma: ${userContext.userSettings.language}
- Moneda: ${userContext.userSettings.currency}
- Notificaciones email: ${userContext.userSettings.emailNotifications ? 'Activadas' : 'Desactivadas'}
- Personalidad chatbot: ${userContext.userSettings.chatbotPersonality}
` : 'Sin configuraciones personalizadas'}

${userContext.sharedSettings ? `🤝 CONFIGURACIONES DE PAREJA:
- Método división gastos: ${userContext.sharedSettings.splitMethod}
- Moneda principal: ${userContext.sharedSettings.defaultCurrency}
- Ciclo presupuesto: ${userContext.sharedSettings.budgetCycle}
- Día inicio ciclo: ${userContext.sharedSettings.budgetStartDay}
- Umbral gastos grandes: €${userContext.sharedSettings.largeExpenseThreshold || 'No configurado'}
` : ''}

💰 ANÁLISIS FINANCIERO DETALLADO:

📊 RESUMEN MENSUAL ACTUAL:
💚 Ingresos: €${userContext.financial?.monthlyIncome?.toFixed(2) || '0.00'}
💸 Gastos: €${userContext.financial?.monthlyExpenses?.toFixed(2) || '0.00'}
⚖️ Balance: €${userContext.financial?.totalBalance?.toFixed(2) || '0.00'} ${userContext.financial?.totalBalance >= 0 ? '(Positivo ✅)' : '(Negativo ⚠️)'}
📈 Transacciones este mes: ${userContext.financial?.monthlyTransactionCount || 0}

📈 COMPARACIÓN CON MES ANTERIOR:
- Ingresos: €${userContext.financial?.lastMonthIncome?.toFixed(2) || '0.00'} → €${userContext.financial?.monthlyIncome?.toFixed(2) || '0.00'} (${userContext.financial?.incomeChange >= 0 ? '+' : ''}€${userContext.financial?.incomeChange?.toFixed(2) || '0.00'})
- Gastos: €${userContext.financial?.lastMonthExpenses?.toFixed(2) || '0.00'} → €${userContext.financial?.monthlyExpenses?.toFixed(2) || '0.00'} (${userContext.financial?.expenseChange >= 0 ? '+' : ''}€${userContext.financial?.expenseChange?.toFixed(2) || '0.00'})

📅 ANÁLISIS ANUAL:
- Ingresos totales año: €${userContext.financial?.yearlyIncome?.toFixed(2) || '0.00'}
- Gastos totales año: €${userContext.financial?.yearlyExpenses?.toFixed(2) || '0.00'}
- Balance anual: €${userContext.financial?.yearlyBalance?.toFixed(2) || '0.00'}
- Promedio transacción: €${userContext.financial?.averageTransactionSize?.toFixed(2) || '0.00'}

🏷️ ANÁLISIS POR CATEGORÍAS (Top 5):
${userContext.financial?.categoryAnalysis?.slice(0, 5).map((cat: any, index: number) => 
  `${index + 1}. ${cat.category}: €${cat.amount.toFixed(2)} (${cat.percentage.toFixed(1)}%) - ${cat.count} transacciones`
).join('\n') || 'Sin categorías analizadas'}

🎯 OBJETIVOS DE AHORRO DETALLADOS:
📊 Resumen: ${userContext.goals?.total || 0} objetivos total (${userContext.goals?.completed || 0} completados, ${userContext.goals?.active || 0} activos)
💰 Total objetivo: €${userContext.goals?.totalTargetAmount?.toFixed(2) || '0.00'}
💵 Total ahorrado: €${userContext.goals?.totalCurrentAmount?.toFixed(2) || '0.00'}
📈 Progreso general: ${userContext.goals?.totalProgress?.toFixed(1) || '0.0'}%

${userContext.goals?.details && userContext.goals.details.length > 0 ? `
OBJETIVOS INDIVIDUALES:
${userContext.goals.details.map((goal: any, index: number) => 
  `${index + 1}. "${goal.name}" (${goal.priorityText} prioridad)
   💰 €${goal.currentAmount}/${goal.targetAmount} (${goal.progress.toFixed(1)}%)
   ⏰ ${goal.targetDate ? `Fecha límite: ${new Date(goal.targetDate).toLocaleDateString('es-ES')}` : 'Sin fecha límite'}
   📅 ${goal.monthsToComplete ? `Tiempo estimado: ${goal.monthsToComplete} mes${goal.monthsToComplete > 1 ? 'es' : ''}` : 'Tiempo no calculable'}
   ${goal.isCompleted ? '✅ COMPLETADO' : '⏳ En progreso'}
   ${goal.description ? `📝 Descripción: ${goal.description}` : ''}`
).join('\n\n')}` : 'Sin objetivos configurados'}

📂 CATEGORÍAS PERSONALIZADAS:
- Total categorías: ${userContext.categories?.total || 0}
- Categorías personalizadas: ${userContext.categories?.custom || 0}
- Categorías ingresos: ${userContext.categories?.income || 0}
- Categorías gastos: ${userContext.categories?.expense || 0}

📅 EVENTOS CALENDARIO:
- Total eventos: ${userContext.calendar?.totalEvents || 0}
- Próximos eventos: ${userContext.calendar?.upcomingEvents || 0}

💡 TRANSACCIONES RECIENTES (Últimas 5):
${userContext.recentTransactions && userContext.recentTransactions.length > 0 ? 
  userContext.recentTransactions.slice(0, 5).map((t: any) => 
    `• ${t.type === 'INCOME' ? '💰' : '💸'} €${t.amount} - ${t.description} (${t.category?.name || 'Sin categoría'}) - ${new Date(t.date).toLocaleDateString('es-ES')}`
  ).join('\n') : 'Sin transacciones recientes'}

${userContext.partner ? `
👥 ANÁLISIS DE PAREJA:
- Pareja: ${userContext.partner.name}
- Perfil conjunto: "${userContext.coupleProfile?.name || 'Sin nombre'}"
- Método división gastos: ${userContext.sharedSettings?.splitMethod || 'No configurado'}
[Analiza colaboración financiera en respuestas]
` : ''}

🔍 INSIGHTS CLAVE DETECTADOS:
${userContext.insights && userContext.insights.length > 0 ? userContext.insights.join('\n') : 'Sin insights disponibles'}

📋 INSTRUCCIONES ESPECIALES:
1. USA SIEMPRE estos datos REALES para dar consejos específicos
2. Menciona cifras exactas cuando sea relevante
3. Compara períodos cuando pregunten sobre tendencias
4. Sugiere objetivos realistas basados en su capacidad de ahorro actual
5. Si preguntan sobre navegación, guíales a la sección correcta con el enlace
6. Personaliza TODAS las respuestas con su información específica
7. Si detectas oportunidades de mejora, sé específico con los números
8. Considera la situación de pareja en todos los consejos financieros

EJEMPLOS DE RESPUESTAS PERSONALIZADAS:
- "Veo que gastaste €X en [categoría] este mes, que es el Y% de tus gastos totales..."
- "Tu objetivo '[nombre objetivo]' está al Z%, te faltan €X para completarlo..."
- "Comparado con el mes pasado, has [mejorado/empeorado] tus gastos en €X..."
- "Con tu ritmo actual de ahorro de €X/mes, completarás tu objetivo en Y meses..."`;
}

/**
 * API para procesar mensajes del chatbot con contexto real
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, conversationHistory } = chatMessageSchema.parse(body);

    console.log(`💬 Chat request from ${session.user.email}: "${content.substring(0, 50)}..."`);

    // Obtener contexto financiero completo del usuario
    const userContext = await getComprehensiveUserContext(session.user.id);
    
    console.log(`📊 Contexto del usuario: ${userContext.summary}`);

    let assistantResponse: string;

    if (!openai) {
      assistantResponse = `🤖 Asistente IA temporalmente no disponible. 

Sin embargo, puedo ayudarte con información básica:
- Tu estado financiero: ${userContext.summary}
- Crear transacciones: /dashboard/transactions/new
- Gestionar objetivos: /dashboard/goals
- Planificar eventos: /dashboard/calendar

Por favor, verifica la configuración de OpenAI.`;
    } else {
      try {
        const systemPrompt = buildEnhancedFinancialAssistantPrompt(userContext);

        // Construir historial de conversación
        const messages = [
          {
            role: "system",
            content: systemPrompt
          }
        ];

        // Añadir historial si existe
        if (conversationHistory && conversationHistory.length > 0) {
          conversationHistory.slice(-10).forEach(msg => { // Últimos 10 mensajes
            messages.push({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content
            });
          });
        }

        // Añadir mensaje actual
        messages.push({
          role: "user", 
          content: content
        });

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: messages,
          max_tokens: 800,
          temperature: 0.7,
        });

        assistantResponse = completion.choices[0]?.message?.content || 
          'Lo siento, no pude procesar tu consulta en este momento.';

      } catch (error) {
        console.error('❌ Error llamando a OpenAI:', error);
        assistantResponse = `🤖 Lo siento, hay un problema temporal con el asistente IA. 

Mientras tanto, aquí tienes tu información financiera:
${userContext.insights && userContext.insights.length > 0 ? userContext.insights.join('\n') : 'Sin datos disponibles'}

Puedes navegar a:
• Ver transacciones: /dashboard/transactions
• Gestionar objetivos: /dashboard/goals  
• Planificar calendario: /dashboard/calendar`;
      }
    }

    return NextResponse.json({
      success: true,
      response: assistantResponse,
      userContext: {
        hasData: userContext.hasData,
        summary: userContext.summary,
        quickStats: userContext.hasData && userContext.financial ? {
          balance: userContext.financial.totalBalance,
          transactions: userContext.financial.transactionCount,
          goals: userContext.goals?.total || 0
        } : null
      }
    });

  } catch (error) {
    console.error('❌ Error en chatbot:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * API para obtener historial de conversación (placeholder)
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Placeholder para futuro historial de conversaciones en BD
    return NextResponse.json({
      success: true,
      conversations: [],
      message: 'Historial de conversaciones próximamente'
    });

  } catch (error) {
    console.error('❌ Error obteniendo historial:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 