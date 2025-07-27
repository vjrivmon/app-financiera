import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { chatMessageSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

// Importar OpenAI solo si la API key está disponible
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
 * Endpoint del chatbot financiero con IA
 * Proporciona asistencia personalizada para finanzas de pareja
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content } = chatMessageSchema.parse(body);

    // Obtener contexto financiero del usuario
    const userContext = await getUserFinancialContext(session.user.id);

    let assistantResponse: string;

    if (!openai) {
      assistantResponse = '🤖 Asistente IA temporalmente no disponible. Por favor, verifica la configuración de OpenAI.';
    } else {
      try {
        // Construir prompt contextual para el asistente financiero
        const systemPrompt = buildFinancialAssistantPrompt(userContext);

        // Llamar a OpenAI
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user", 
              content: content
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        });

        assistantResponse = completion.choices[0]?.message?.content || 
          'Lo siento, no pude procesar tu consulta en este momento.';
      } catch (error) {
        console.error('❌ Error llamando a OpenAI:', error);
        assistantResponse = '🤖 Lo siento, hay un problema temporal con el asistente IA. Inténtalo de nuevo en unos momentos.';
      }
    }

    // Log para auditoría
    console.log(`💬 Chat request from user ${session.user.email}: "${content.substring(0, 50)}..."`);

    return NextResponse.json({
      success: true,
      response: assistantResponse,
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
 * Obtiene el contexto financiero del usuario para personalizar las respuestas
 */
async function getUserFinancialContext(userId: string) {
  try {
    const [user, recentTransactions, budgets, savingsGoals] = await Promise.all([
      // Usuario con pareja
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          coupleProfile: true,
          settings: true,
        },
      }),

      // Últimas transacciones
      prisma.transaction.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { date: 'desc' },
        take: 5,
      }),

      // Presupuestos activos
      prisma.budget.findMany({
        where: {
          couple: {
            users: { some: { id: userId } }
          },
          isActive: true,
        },
        include: { category: true },
        take: 3,
      }),

      // Objetivos de ahorro
      prisma.savingsGoal.findMany({
        where: {
          couple: {
            users: { some: { id: userId } }
          },
        },
        take: 3,
      }),
    ]);

    return {
      user,
      recentTransactions,
      budgets,
      savingsGoals,
      hasCouple: !!user?.coupleProfile,
    };
  } catch (error) {
    console.error('❌ Error obteniendo contexto:', error);
    return null;
  }
}

/**
 * Construye el prompt del sistema para el asistente financiero
 */
function buildFinancialAssistantPrompt(context: any): string {
  const basePrompt = `Eres un asistente financiero especializado en finanzas para parejas. Tu nombre es "FinanceBot" y trabajas para Budget Couple App.

PERSONALIDAD:
- Amigable, profesional y empático
- Usas emojis ocasionalmente para ser más cercano
- Hablas en español con un tono conversacional pero informativo
- Eres experto en finanzas personales, presupuestos y planificación financiera en pareja

REGLAS IMPORTANTES:
- NUNCA inventes cifras o datos específicos del usuario
- Solo usa la información del contexto que te proporciono
- Si no tienes información suficiente, pide aclaración al usuario
- Mantén las respuestas concisas (máximo 3-4 párrafos)
- Incluye consejos prácticos y accionables
- Enfócate en finanzas de pareja cuando sea relevante`;

  if (!context) {
    return basePrompt + "\n\nNOTA: No tengo acceso al contexto financiero del usuario en este momento.";
  }

  const contextPrompt = `
CONTEXTO DEL USUARIO:
- Usuario: ${context.user?.name || 'Usuario'}
- Tiene pareja: ${context.hasCouple ? 'Sí' : 'No'}
- Transacciones recientes: ${context.recentTransactions?.length || 0} transacciones
- Presupuestos activos: ${context.budgets?.length || 0} presupuestos
- Objetivos de ahorro: ${context.savingsGoals?.length || 0} objetivos

ÚLTIMAS TRANSACCIONES:
${context.recentTransactions?.map((t: any) => 
  `- ${t.type === 'EXPENSE' ? '💸' : '💰'} €${t.amount} - ${t.description} (${t.category?.name || 'Sin categoría'})`
).join('\n') || 'No hay transacciones recientes'}`;

  return basePrompt + contextPrompt;
}

/**
 * Endpoint para obtener historial de conversaciones (futuro)
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

    // Por ahora retornamos un array vacío
    return NextResponse.json({
      success: true,
      conversations: [],
    });

  } catch (error) {
    console.error('❌ Error obteniendo historial:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 