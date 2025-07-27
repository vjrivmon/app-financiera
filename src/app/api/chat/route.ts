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
 * Obtener contexto financiero completo del usuario
 */
async function getComprehensiveUserContext(userId: string) {
  try {
    // Buscar el usuario y su coupleId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        name: true, 
        email: true, 
        coupleId: true 
      }
    });

    if (!user?.coupleId) {
      return {
        hasData: false,
        user: user,
        summary: 'Usuario sin datos financieros configurados',
        insights: []
      };
    }

    // Obtener fecha actual para cálculos
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Obtener todas las transacciones
    const allTransactions = await prisma.transaction.findMany({
      where: { coupleId: user.coupleId },
      include: {
        category: { select: { name: true, icon: true } },
        user: { select: { name: true } }
      },
      orderBy: { date: 'desc' },
      take: 50 // Últimas 50 transacciones
    });

    // Transacciones del mes actual
    const monthlyTransactions = allTransactions.filter(t => 
      new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth
    );

    // Calcular totales
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalBalance = monthlyIncome - monthlyExpenses;

    // Obtener objetivos de ahorro
    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { coupleId: user.coupleId },
      orderBy: { createdAt: 'desc' }
    });

    // Calcular progreso de objetivos
    const goalsWithProgress = savingsGoals.map(goal => ({
      ...goal,
      progress: (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100,
      isCompleted: Number(goal.currentAmount) >= Number(goal.targetAmount),
      amountNeeded: Number(goal.targetAmount) - Number(goal.currentAmount)
    }));

    // Análisis por categorías
    const expensesByCategory = monthlyTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => {
        const categoryName = t.category.name;
        acc[categoryName] = (acc[categoryName] || 0) + Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

    const topExpenseCategory = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => b - a)[0];

    // Generar insights financieros
    const insights = [];
    
    if (totalBalance > 0) {
      insights.push(`✅ Tienes un balance positivo de €${totalBalance.toFixed(2)} este mes`);
    } else if (totalBalance < 0) {
      insights.push(`⚠️ Estás gastando €${Math.abs(totalBalance).toFixed(2)} más de lo que ingresas este mes`);
    }

    if (topExpenseCategory) {
      insights.push(`📊 Tu mayor gasto es en ${topExpenseCategory[0]}: €${topExpenseCategory[1].toFixed(2)}`);
    }

    if (goalsWithProgress.length > 0) {
      const activeGoals = goalsWithProgress.filter(g => !g.isCompleted);
      const completedGoals = goalsWithProgress.filter(g => g.isCompleted);
      
      if (completedGoals.length > 0) {
        insights.push(`🎉 Has completado ${completedGoals.length} objetivo${completedGoals.length > 1 ? 's' : ''}`);
      }
      
      if (activeGoals.length > 0) {
        const closestGoal = activeGoals.sort((a, b) => b.progress - a.progress)[0];
        if (closestGoal) {
          insights.push(`🎯 Tu objetivo más avanzado es "${closestGoal.name}" con ${closestGoal.progress.toFixed(1)}% completado`);
        }
      }
    }

    return {
      hasData: true,
      user,
      financial: {
        monthlyIncome,
        monthlyExpenses,
        totalBalance,
        transactionCount: allTransactions.length,
        monthlyTransactionCount: monthlyTransactions.length,
        topExpenseCategory
      },
      goals: {
        total: savingsGoals.length,
        completed: goalsWithProgress.filter(g => g.isCompleted).length,
        active: goalsWithProgress.filter(g => !g.isCompleted).length,
        details: goalsWithProgress.slice(0, 5) // Top 5 objetivos
      },
      recentTransactions: allTransactions.slice(0, 5),
      insights,
      summary: `Usuario con ${allTransactions.length} transacciones, ${savingsGoals.length} objetivos, balance mensual: €${totalBalance.toFixed(2)}`
    };

  } catch (error) {
    console.error('❌ Error obteniendo contexto del usuario:', error);
    return {
      hasData: false,
      summary: 'Error al obtener datos financieros',
      insights: []
    };
  }
}

/**
 * Construir prompt mejorado para el asistente financiero
 */
function buildEnhancedFinancialAssistantPrompt(userContext: any) {
  const basePrompt = `Eres FinanceBot Pro, el asistente financiero personal más avanzado de Budget Couple App.

INFORMACIÓN DEL USUARIO:
- Nombre: ${userContext.user?.name || 'Usuario'}
- Email: ${userContext.user?.email || 'No disponible'}
- Estado: ${userContext.hasData ? 'Con datos financieros' : 'Sin datos financieros'}

`;

  if (!userContext.hasData) {
    return basePrompt + `
El usuario aún no ha configurado datos financieros. Guíalo para:
1. Crear su primera transacción en /dashboard/transactions/new
2. Establecer objetivos de ahorro en /dashboard/goals/new
3. Usar el calendario para planificar gastos en /dashboard/calendar

Sé motivador y explica los beneficios de cada funcionalidad.`;
  }

  return basePrompt + `
DATOS FINANCIEROS ACTUALES:
📊 Balance del mes: €${userContext.financial?.totalBalance?.toFixed(2) || '0.00'}
💰 Ingresos del mes: €${userContext.financial?.monthlyIncome?.toFixed(2) || '0.00'}
💸 Gastos del mes: €${userContext.financial?.monthlyExpenses?.toFixed(2) || '0.00'}
📈 Total transacciones: ${userContext.financial?.transactionCount || 0}
📅 Transacciones este mes: ${userContext.financial?.monthlyTransactionCount || 0}

🎯 OBJETIVOS DE AHORRO:
- Total objetivos: ${userContext.goals?.total || 0}
- Objetivos completados: ${userContext.goals?.completed || 0}
- Objetivos activos: ${userContext.goals?.active || 0}

${userContext.goals?.details && userContext.goals.details.length > 0 ? `
OBJETIVOS DETALLADOS:
${userContext.goals.details.map((goal: any) => 
  `• "${goal.name}": €${goal.currentAmount}/${goal.targetAmount} (${goal.progress.toFixed(1)}% completado)${goal.isCompleted ? ' ✅ COMPLETADO' : ''}`
).join('\n')}` : ''}

${userContext.recentTransactions && userContext.recentTransactions.length > 0 ? `
TRANSACCIONES RECIENTES:
${userContext.recentTransactions.map((t: any) => 
  `• ${t.type === 'INCOME' ? '+' : '-'}€${t.amount} - ${t.description} (${t.category.name})`
).join('\n')}` : ''}

🔍 INSIGHTS CLAVE:
${userContext.insights && userContext.insights.length > 0 ? userContext.insights.join('\n') : 'Sin insights disponibles'}

INSTRUCCIONES ESPECÍFICAS:
1. Usa estos datos REALES para dar consejos personalizados
2. Sugiere acciones específicas basadas en su situación actual
3. Si recomiendas crear algo, proporciona enlaces directos:
   - Nueva transacción: /dashboard/transactions/new
   - Nuevo objetivo: /dashboard/goals/new
   - Ver objetivos: /dashboard/goals
   - Ver transacciones: /dashboard/transactions
   - Planificar en calendario: /dashboard/calendar
   - Ver análisis: /dashboard/analysis

4. Sé específico con los números y datos reales del usuario
5. Celebra sus logros y motívalo en áreas de mejora
6. Si pregunta sobre datos específicos, consulta la información proporcionada arriba

Responde de manera conversacional, profesional y útil. Usa emojis moderadamente para hacer la conversación más amigable.`;
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
    const { content, context, conversationHistory } = chatMessageSchema.parse(body);

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