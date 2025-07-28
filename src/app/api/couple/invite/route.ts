import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

// Schema de validación para invitaciones
const inviteSchema = z.object({
  partnerEmail: z.string().email('Email inválido'),
  message: z.string().max(500, 'El mensaje no puede tener más de 500 caracteres').optional(),
});

/**
 * API para crear invitación de pareja con enlace exclusivo
 * Genera token único y sistema de seguridad empresarial
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
    const { partnerEmail, message } = inviteSchema.parse(body);

    // Verificar que el usuario no tenga ya pareja
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        coupleProfile: {
          include: {
            users: true
          }
        }
      }
    });

    if (currentUser?.coupleProfile && currentUser.coupleProfile.users.length >= 2) {
      return NextResponse.json(
        { error: 'Ya tienes una pareja configurada' },
        { status: 400 }
      );
    }

    // Verificar que no se invite a sí mismo
    if (partnerEmail.toLowerCase() === currentUser?.email?.toLowerCase()) {
      return NextResponse.json(
        { error: 'No puedes invitarte a ti mismo' },
        { status: 400 }
      );
    }

    // Verificar si el usuario invitado ya existe
    const partnerUser = await prisma.user.findUnique({
      where: { email: partnerEmail.toLowerCase() },
      include: {
        coupleProfile: {
          include: {
            users: true
          }
        }
      }
    });

    // Si el usuario existe y ya tiene pareja, no permitir invitación
    if (partnerUser?.coupleProfile && partnerUser.coupleProfile.users.length >= 2) {
      return NextResponse.json(
        { error: 'Esta persona ya tiene una pareja configurada' },
        { status: 400 }
      );
    }

    // Generar token único y seguro
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días

    // Crear o actualizar perfil de pareja del invitador
    let coupleProfile;
    if (currentUser?.coupleProfile) {
      coupleProfile = currentUser.coupleProfile;
    } else {
      // Crear nuevo perfil de pareja
      const defaultCoupleName = `${currentUser?.name?.split(' ')[0] || 'Usuario'} y pareja`;
      
      coupleProfile = await prisma.coupleProfile.create({
        data: {
          name: defaultCoupleName,
          currency: 'EUR',
          timezone: 'Europe/Madrid',
          users: {
            connect: { id: currentUser!.id }
          },
          sharedSettings: {
            create: {
              splitMethod: 'EQUAL',
              defaultCurrency: 'EUR',
              budgetCycle: 'MONTHLY',
              budgetStartDay: 1,
              sharedGoalNotifications: true,
            }
          }
        }
      });

      // Actualizar usuario con coupleId
      await prisma.user.update({
        where: { id: currentUser!.id },
        data: { coupleId: coupleProfile.id }
      });
    }

    // Usar tabla RecurringTransaction temporalmente para almacenar invitaciones
    // En producción se crearía una tabla específica para invitaciones
    const invitation = await prisma.recurringTransaction.create({
      data: {
        name: `INVITE_${inviteToken}`,
        amount: 0,
        type: 'INCOME',
        frequency: 'MONTHLY',
        startDate: new Date(),
        endDate: expiresAt,
        isActive: true,
        nextDue: expiresAt,
        coupleId: coupleProfile.id,
        categoryId: 'temp', // Temporal para invitaciones
        // Almacenar datos de invitación en los campos disponibles
        dayOfMonth: partnerUser?.id ? parseInt(partnerUser.id.slice(-2), 16) : 0, // ID del usuario invitado si existe
        dayOfWeek: 1, // Indicador de que es una invitación
      }
    });

    // Generar enlace de invitación
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/invite/${inviteToken}`;

    console.log(`✅ Invitación creada: ${currentUser?.email} invita a ${partnerEmail}`);
    console.log(`🔗 Enlace de invitación: ${inviteUrl}`);

    // En producción aquí se enviaría el email de invitación
    // Para MVP, devolvemos el enlace directamente
    
    return NextResponse.json({
      success: true,
      message: 'Invitación creada exitosamente',
      inviteUrl,
      invitation: {
        id: invitation.id,
        partnerEmail,
        message: message || '',
        expiresAt,
        inviteToken,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('❌ Error creando invitación:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de invitación inválidos', details: error.errors },
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
 * API para obtener invitaciones pendientes del usuario
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

    // Buscar invitaciones pendientes
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coupleId: true }
    });

    if (!user?.coupleId) {
      return NextResponse.json({ invitations: [] });
    }

    // Buscar invitaciones en RecurringTransaction
    const invitations = await prisma.recurringTransaction.findMany({
      where: {
        coupleId: user.coupleId,
        name: { startsWith: 'INVITE_' },
        isActive: true,
        endDate: { gte: new Date() } // No expiradas
      },
      orderBy: { createdAt: 'desc' }
    });

    const processedInvitations = invitations.map(inv => ({
      id: inv.id,
      token: inv.name.replace('INVITE_', ''),
      status: 'pending',
      expiresAt: inv.endDate,
      createdAt: inv.createdAt,
    }));

    return NextResponse.json({
      success: true,
      invitations: processedInvitations
    });

  } catch (error) {
    console.error('❌ Error obteniendo invitaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 