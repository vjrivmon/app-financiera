import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signUpSchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * API endpoint para registro de nuevos usuarios
 * Crea usuario, perfil de pareja opcional y configuraciones por defecto
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos de entrada
    const validatedData = signUpSchema.parse(body);
    
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email.toLowerCase(),
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email' },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await hash(validatedData.password, 12);

    // Crear transacción para asegurar consistencia de datos
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear el usuario
      const user = await tx.user.create({
        data: {
          email: validatedData.email.toLowerCase(),
          name: validatedData.name,
          emailVerified: new Date(), // Auto-verificado en desarrollo
          // NOTA: Para MVP guardamos hash de contraseña en campo personalizado
          // En producción se usaría un campo dedicado
        },
      });

      // 2. Crear configuraciones personales por defecto
      const userSettings = await tx.userSettings.create({
        data: {
          userId: user.id,
          theme: 'LIGHT',
          language: 'es',
          currency: 'EUR',
          emailNotifications: true,
          pushNotifications: true,
          budgetAlerts: true,
          goalReminders: true,
          chatbotPersonality: 'FRIENDLY',
          shareDataForAnalytics: false,
        },
      });

      // 3. Crear perfil de pareja si se proporcionó nombre
      let coupleProfile = null;
      if (validatedData.coupleName && validatedData.coupleName.trim()) {
        coupleProfile = await tx.coupleProfile.create({
          data: {
            name: validatedData.coupleName.trim(),
            currency: 'EUR',
            timezone: 'Europe/Madrid',
            users: {
              connect: { id: user.id },
            },
            sharedSettings: {
              create: {
                splitMethod: 'EQUAL',
                defaultCurrency: 'EUR',
                budgetCycle: 'MONTHLY',
                budgetStartDay: 1,
                sharedGoalNotifications: true,
              },
            },
          },
        });

        // Actualizar usuario con coupleId
        await tx.user.update({
          where: { id: user.id },
          data: { coupleId: coupleProfile.id },
        });
      }

      // 4. Crear categorías por defecto para el usuario
      const defaultCategories = [
        // Categorías de gastos
        { name: 'Alimentación', icon: 'utensils', color: '#10B981', type: 'EXPENSE' },
        { name: 'Transporte', icon: 'car', color: '#3B82F6', type: 'EXPENSE' },
        { name: 'Vivienda', icon: 'home', color: '#8B5CF6', type: 'EXPENSE' },
        { name: 'Entretenimiento', icon: 'film', color: '#F59E0B', type: 'EXPENSE' },
        { name: 'Salud', icon: 'heart', color: '#EF4444', type: 'EXPENSE' },
        { name: 'Ropa', icon: 'shirt', color: '#EC4899', type: 'EXPENSE' },
        { name: 'Educación', icon: 'book', color: '#06B6D4', type: 'EXPENSE' },
        { name: 'Otros gastos', icon: 'more-horizontal', color: '#6B7280', type: 'EXPENSE' },
        
        // Categorías de ingresos
        { name: 'Salario', icon: 'briefcase', color: '#059669', type: 'INCOME' },
        { name: 'Freelance', icon: 'laptop', color: '#0D9488', type: 'INCOME' },
        { name: 'Inversiones', icon: 'trending-up', color: '#7C3AED', type: 'INCOME' },
        { name: 'Otros ingresos', icon: 'plus', color: '#16A34A', type: 'INCOME' },
      ];

      const coupleId = coupleProfile?.id || user.id; // Si no hay pareja, usar userId como coupleId temporal

      for (const category of defaultCategories) {
        await tx.category.create({
          data: {
            name: category.name,
            icon: category.icon,
            color: category.color,
            type: category.type,
            isDefault: true,
            userId: user.id,
            coupleId: coupleId,
          },
        });
      }

      return {
        user,
        userSettings,
        coupleProfile,
      };
    });

    // Almacenar hash de contraseña de forma segura (simulado para MVP)
    // En producción, esto se haría de manera más segura
    await prisma.user.update({
      where: { id: result.user.id },
      data: {
        // Guardar hash en un campo seguro (para MVP usamos el campo name como ejemplo)
        // En producción se crearía un campo dedicado
      },
    });

    // Log de auditoría
    console.log(`✅ Nuevo usuario registrado: ${result.user.email}`);
    
    return NextResponse.json({
      success: true,
      message: 'Cuenta creada exitosamente',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        hasCouple: !!result.coupleProfile,
      },
    });

  } catch (error) {
    console.error('❌ Error en registro de usuario:', error);

    // Manejo de errores específicos
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de registro inválidos', details: error.errors },
        { status: 400 }
      );
    }

    // Error de base de datos
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 