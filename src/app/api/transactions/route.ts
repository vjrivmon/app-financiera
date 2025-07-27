import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { transactionSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

/**
 * Crear categorías por defecto si no existen
 */
async function ensureDefaultCategories(coupleId: string) {
  const defaultCategories = [
    { name: 'alimentacion', displayName: 'Alimentación', icon: '🍽️', color: '#10B981', type: 'EXPENSE' },
    { name: 'transporte', displayName: 'Transporte', icon: '🚗', color: '#3B82F6', type: 'EXPENSE' },
    { name: 'vivienda', displayName: 'Vivienda', icon: '🏠', color: '#8B5CF6', type: 'EXPENSE' },
    { name: 'entretenimiento', displayName: 'Entretenimiento', icon: '🎬', color: '#F59E0B', type: 'EXPENSE' },
    { name: 'salud', displayName: 'Salud', icon: '❤️', color: '#EF4444', type: 'EXPENSE' },
    { name: 'trabajo', displayName: 'Trabajo', icon: '💼', color: '#06B6D4', type: 'INCOME' },
    { name: 'educacion', displayName: 'Educación', icon: '📚', color: '#84CC16', type: 'EXPENSE' },
    { name: 'otros', displayName: 'Otros', icon: '📦', color: '#6B7280', type: 'EXPENSE' }
  ];

  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: {
        name_coupleId: {
          name: category.displayName,
          coupleId: coupleId
        }
      },
      update: {},
      create: {
        name: category.displayName,
        icon: category.icon,
        color: category.color,
        type: category.type,
        isDefault: true,
        coupleId: coupleId
      }
    });
  }
}

/**
 * Mapear nombres de categoría a IDs reales
 */
async function getCategoryId(categoryName: string, coupleId: string): Promise<string> {
  const categoryMap: { [key: string]: string } = {
    'alimentacion': 'Alimentación',
    'transporte': 'Transporte', 
    'vivienda': 'Vivienda',
    'entretenimiento': 'Entretenimiento',
    'salud': 'Salud',
    'trabajo': 'Trabajo',
    'educacion': 'Educación',
    'otros': 'Otros'
  };

  const displayName = categoryMap[categoryName] || categoryName;
  
  // Buscar la categoría existente
  const category = await prisma.category.findFirst({
    where: {
      name: displayName,
      coupleId: coupleId
    }
  });

  if (category) {
    return category.id;
  }

  // Si no existe, crear una nueva categoría "Otros"
  const newCategory = await prisma.category.create({
    data: {
      name: 'Otros',
      icon: '📦',
      color: '#6B7280',
      type: 'EXPENSE',
      isDefault: true,
      coupleId: coupleId
    }
  });

  return newCategory.id;
}

/**
 * API para obtener transacciones con filtros y paginación
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
      return NextResponse.json({ transactions: [], total: 0 });
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

         // Construir filtros dinámicos
     const filters: any = { coupleId: user.coupleId };

    // Filtro por tipo
    if (searchParams.has('type')) {
      filters.type = searchParams.get('type');
    }

    // Filtro por categoría
    if (searchParams.has('categoryId')) {
      filters.categoryId = searchParams.get('categoryId');
    }

    // Filtro por rango de fechas
    if (searchParams.has('startDate') && searchParams.has('endDate')) {
      filters.date = {
        gte: new Date(searchParams.get('startDate') as string),
        lte: new Date(searchParams.get('endDate') as string)
      };
    }

    // Filtro por búsqueda de texto
    if (searchParams.has('search')) {
      filters.description = {
        contains: searchParams.get('search'),
        mode: 'insensitive'
      };
    }

    // Configurar paginación y ordenamiento
    const pagination = {
      skip: offset,
      take: limit,
      sortBy: searchParams.get('sortBy') || 'date',
      sortOrder: searchParams.get('sortOrder') || 'desc'
    };

    // Obtener transacciones
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: filters,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { [pagination.sortBy as string]: pagination.sortOrder },
        include: {
          category: {
            select: {
              name: true,
              icon: true,
              color: true
            }
          },
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.transaction.count({ where: filters })
    ]);

    console.log(`📊 Transacciones encontradas: ${transactions.length} de ${total} total`);

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: transactions.length,
        totalItems: total
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo transacciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * API para crear nueva transacción - ARREGLADA
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
    console.log('📥 Datos recibidos para transacción:', body);

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

    // Asegurar que existen las categorías por defecto
    await ensureDefaultCategories(user.coupleId);

    // Convertir la fecha string a Date object ANTES de la validación
    const processedBody = {
      ...body,
      date: new Date(body.date).toISOString(), // Convertir string a ISO string
    };

    // Validar datos con schema actualizado
    const validatedData = transactionSchema.parse(processedBody);

    // Obtener el ID real de la categoría
    const realCategoryId = await getCategoryId(validatedData.categoryId, user.coupleId);

    console.log(`📁 Categoría mapeada: ${validatedData.categoryId} -> ${realCategoryId}`);

    // Crear la transacción en la base de datos
    const newTransaction = await prisma.transaction.create({
      data: {
        amount: validatedData.amount,
        description: validatedData.description,
        type: validatedData.type,
        date: new Date(validatedData.date),
        notes: validatedData.notes || null,
        location: validatedData.location || null,
        receipt: validatedData.receipt || null,
        categoryId: realCategoryId,
        userId: session.user.id,
        coupleId: user.coupleId,
      },
      include: {
        category: {
          select: {
            name: true,
            icon: true,
            color: true
          }
        }
      }
    });

    console.log('✅ Transacción creada en BD:', newTransaction);

    return NextResponse.json({
      success: true,
      transaction: newTransaction,
      message: `${validatedData.type === 'INCOME' ? 'Ingreso' : 'Gasto'} de €${validatedData.amount} registrado correctamente`
    });

  } catch (error) {
    console.error('❌ Error creando transacción:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos de transacción inválidos', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 