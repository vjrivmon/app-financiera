import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { transactionSchema, transactionFiltersSchema, paginationSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * GET /api/transactions - Obtener transacciones del usuario con filtros y paginación
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Parsear parámetros de consulta
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validar parámetros de paginación
    const pagination = paginationSchema.parse({
      page: queryParams.page ? parseInt(queryParams.page) : 1,
      limit: queryParams.limit ? parseInt(queryParams.limit) : 20,
      sortBy: queryParams.sortBy || 'date',
      sortOrder: queryParams.sortOrder || 'desc',
    });

    // Validar filtros si existen
    let filters: any = {};
    if (Object.keys(queryParams).some(key => ['type', 'categoryId', 'startDate', 'endDate'].includes(key))) {
      filters = transactionFiltersSchema.parse({
        type: queryParams.type,
        categoryId: queryParams.categoryId,
        startDate: queryParams.startDate ? new Date(queryParams.startDate) : undefined,
        endDate: queryParams.endDate ? new Date(queryParams.endDate) : undefined,
        search: queryParams.search,
      });
    }

    // Construir condiciones de búsqueda
    const where = {
      userId: session.user.id,
      ...(filters.type && { type: filters.type }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.startDate || filters.endDate) && {
        date: {
          ...(filters.startDate && { gte: filters.startDate }),
          ...(filters.endDate && { lte: filters.endDate }),
        },
      },
      ...(filters.search && {
        OR: [
          { description: { contains: filters.search, mode: 'insensitive' } },
          { notes: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    // Ejecutar consultas en paralelo
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { [pagination.sortBy as string]: pagination.sortOrder },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(totalCount / pagination.limit);
    const hasNext = pagination.page < totalPages;
    const hasPrev = pagination.page > 1;

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: totalCount,
        totalPages,
        hasNext,
        hasPrev,
      },
    });

  } catch (error) {
    console.error('❌ Error obteniendo transacciones:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parámetros de consulta inválidos', details: error.errors },
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
 * POST /api/transactions - Crear nueva transacción
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Parsear y validar datos
    const body = await request.json();
    const validatedData = transactionSchema.parse(body);

    // Verificar que la categoría pertenece al usuario o su pareja
    const category = await prisma.category.findFirst({
      where: {
        id: validatedData.categoryId,
        OR: [
          { userId: session.user.id },
          { 
            couple: {
              users: { some: { id: session.user.id } }
            }
          },
        ],
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Categoría no encontrada o sin permisos' },
        { status: 403 }
      );
    }

    // Obtener coupleId del usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coupleId: true },
    });

    // Crear transacción
    const transaction = await prisma.transaction.create({
      data: {
        amount: validatedData.amount,
        description: validatedData.description,
        type: validatedData.type,
        categoryId: validatedData.categoryId,
        date: validatedData.date,
        notes: validatedData.notes || null,
        location: validatedData.location || null,
        receipt: validatedData.receipt || null,
        userId: session.user.id,
        coupleId: user?.coupleId || session.user.id, // Usar userId si no tiene pareja
      },
      include: {
        category: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Log de auditoría
    console.log(`💰 Nueva transacción creada por ${session.user.email}: ${validatedData.type} €${validatedData.amount}`);

    return NextResponse.json({
      success: true,
      data: transaction,
      message: 'Transacción creada exitosamente',
    });

  } catch (error) {
    console.error('❌ Error creando transacción:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de transacción inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 