import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para eventos de calendario
const calendarEventSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  type: z.enum(['income', 'expense', 'reminder', 'goal'], {
    errorMap: () => ({ message: 'Tipo debe ser income, expense, reminder o goal' })
  }),
  amount: z.number().positive().optional(),
  date: z.string().min(1, 'La fecha es requerida'),
  description: z.string().optional(),
});

/**
 * API para crear eventos de calendario
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
    console.log('📅 Datos recibidos para evento:', body);

    // Validar datos
    const validatedData = calendarEventSchema.parse(body);

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

    // Como no tenemos tabla de eventos, usaremos RecurringTransaction como base
    // Esto es una implementación temporal hasta tener una tabla dedicada
    const newEvent = await prisma.recurringTransaction.create({
      data: {
        name: validatedData.title,
        amount: validatedData.amount || 0,
        type: validatedData.type === 'income' ? 'INCOME' : 'EXPENSE',
        frequency: 'DAILY', // Placeholder
        startDate: new Date(validatedData.date),
        nextDue: new Date(validatedData.date),
        isActive: false, // No es una transacción real recurrente
        categoryId: 'otros', // Placeholder
        coupleId: user.coupleId,
      },
    });

    console.log('✅ Evento creado en BD:', newEvent);

    // Convertir a formato de respuesta
    const eventResponse = {
      id: newEvent.id,
      title: newEvent.name,
      type: newEvent.type.toLowerCase(),
      amount: newEvent.amount,
      date: newEvent.startDate,
      description: '',
    };

    return NextResponse.json({
      success: true,
      event: eventResponse,
      message: `Evento "${validatedData.title}" creado correctamente`
    });

  } catch (error) {
    console.error('❌ Error creando evento:', error);

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
 * API para obtener eventos de calendario
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
      return NextResponse.json({ events: [] });
    }

    // Obtener parámetros de consulta para filtrar por mes/año
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      dateFilter = {
        startDate: {
          gte: startDate,
          lte: endDate
        }
      };
    }

    // Obtener eventos (usando RecurringTransaction como almacén temporal)
    const events = await prisma.recurringTransaction.findMany({
      where: {
        coupleId: user.coupleId,
        isActive: false, // Solo los que son eventos, no transacciones recurrentes reales
        ...dateFilter
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    // Convertir a formato de respuesta
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.name,
      type: event.type.toLowerCase(),
      amount: event.amount,
      date: event.startDate,
      description: '',
    }));

    console.log(`📅 Eventos encontrados: ${formattedEvents.length}`);

    return NextResponse.json({
      success: true,
      events: formattedEvents,
      count: formattedEvents.length
    });

  } catch (error) {
    console.error('❌ Error obteniendo eventos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * API para eliminar eventos de calendario
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de evento requerido' },
        { status: 400 }
      );
    }

    // Eliminar el evento
    await prisma.recurringTransaction.delete({
      where: { id: eventId }
    });

    console.log(`🗑️ Evento eliminado: ${eventId}`);

    return NextResponse.json({
      success: true,
      message: 'Evento eliminado correctamente'
    });

  } catch (error) {
    console.error('❌ Error eliminando evento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 