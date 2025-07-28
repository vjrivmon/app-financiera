import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * API para obtener categorías disponibles del usuario
 */
export async function GET(_request: NextRequest) {
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
      // Si no tiene pareja, crear categorías temporales para el usuario
      const defaultCategories = [
        { id: 'alimentacion', name: 'Alimentación', icon: '🍽️', type: 'EXPENSE' },
        { id: 'transporte', name: 'Transporte', icon: '🚗', type: 'EXPENSE' },
        { id: 'vivienda', name: 'Vivienda', icon: '🏠', type: 'EXPENSE' },
        { id: 'entretenimiento', name: 'Entretenimiento', icon: '🎬', type: 'EXPENSE' },
        { id: 'salud', name: 'Salud', icon: '❤️', type: 'EXPENSE' },
        { id: 'trabajo', name: 'Trabajo', icon: '💼', type: 'INCOME' },
        { id: 'educacion', name: 'Educación', icon: '📚', type: 'EXPENSE' },
        { id: 'otros', name: 'Otros', icon: '📦', type: 'EXPENSE' }
      ];

      return NextResponse.json({
        success: true,
        categories: defaultCategories
      });
    }

    // Crear categorías por defecto si no existen
    await ensureDefaultCategories(user.coupleId);

    // Obtener categorías de la pareja
    const categories = await prisma.category.findMany({
      where: { coupleId: user.coupleId },
      select: {
        id: true,
        name: true,
        icon: true,
        type: true,
        color: true,
        isDefault: true
      },
      orderBy: [
        { isDefault: 'desc' }, // Primero las por defecto
        { name: 'asc' } // Luego alfabético
      ]
    });

    return NextResponse.json({
      success: true,
      categories: categories
    });

  } catch (error) {
    console.error('❌ Error obteniendo categorías:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * Crear categorías por defecto si no existen
 */
async function ensureDefaultCategories(coupleId: string) {
  const defaultCategories = [
    { name: 'Alimentación', icon: '🍽️', color: '#10B981', type: 'EXPENSE' },
    { name: 'Transporte', icon: '🚗', color: '#3B82F6', type: 'EXPENSE' },
    { name: 'Vivienda', icon: '🏠', color: '#8B5CF6', type: 'EXPENSE' },
    { name: 'Entretenimiento', icon: '🎬', color: '#F59E0B', type: 'EXPENSE' },
    { name: 'Salud', icon: '❤️', color: '#EF4444', type: 'EXPENSE' },
    { name: 'Trabajo', icon: '💼', color: '#06B6D4', type: 'INCOME' },
    { name: 'Educación', icon: '📚', color: '#84CC16', type: 'EXPENSE' },
    { name: 'Otros', icon: '📦', color: '#6B7280', type: 'EXPENSE' }
  ];

  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: {
        name_coupleId: {
          name: category.name,
          coupleId: coupleId
        }
      },
      update: {},
      create: {
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
        isDefault: true,
        coupleId: coupleId
      }
    });
  }
} 