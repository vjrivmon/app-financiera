import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para objetivos
const createGoalSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  targetAmount: z.number().positive('El monto debe ser positivo'),
  currentAmount: z.number().min(0).default(0),
  targetDate: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
});

/**
 * API para crear objetivos de ahorro
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
    console.log('📥 Datos recibidos para objetivo:', body);

    // Validar datos
    const validatedData = createGoalSchema.parse(body);

    // Buscar el usuario y su coupleId
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coupleId: true }
    });

    if (!user?.coupleId) {
      return NextResponse.json(
        { error: 'Usuario sin perfil de pareja configurado' },
        { status: 400 }
      );
    }

    // Crear el objetivo en la base de datos
    const newGoal = await prisma.savingsGoal.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        targetAmount: validatedData.targetAmount,
        currentAmount: validatedData.currentAmount,
        targetDate: validatedData.targetDate ? new Date(validatedData.targetDate) : null,
        priority: validatedData.priority,
        isCompleted: false,
        coupleId: user.coupleId,
      },
    });

    console.log('✅ Objetivo creado en BD:', newGoal);

    return NextResponse.json({
      success: true,
      goal: newGoal,
      message: `Objetivo "${validatedData.name}" creado correctamente`
    });

  } catch (error) {
    console.error('❌ Error creando objetivo:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * API para obtener objetivos de ahorro
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Buscar el usuario y su coupleId
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coupleId: true }
    });

    if (!user?.coupleId) {
      return NextResponse.json({ goals: [] });
    }

    // Obtener objetivos de la pareja
    const goals = await prisma.savingsGoal.findMany({
      where: {
        coupleId: user.coupleId,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Objetivos encontrados: ${goals.length}`);

    return NextResponse.json({
      success: true,
      goals,
      count: goals.length
    });

  } catch (error) {
    console.error('❌ Error obteniendo objetivos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 