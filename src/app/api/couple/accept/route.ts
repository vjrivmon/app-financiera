import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para aceptar invitación
const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Token de invitación requerido'),
});

/**
 * API para aceptar invitación de pareja
 * Conecta usuarios de forma segura y crea perfil compartido
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para aceptar la invitación' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { token } = acceptInviteSchema.parse(body);

    // Buscar la invitación por token
    const invitation = await prisma.recurringTransaction.findFirst({
      where: {
        name: `INVITE_${token}`,
        isActive: true,
        endDate: { gte: new Date() } // No expirada
      },
      include: {
        couple: {
          include: {
            users: true,
            sharedSettings: true
          }
        }
      }
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitación no válida o expirada' },
        { status: 404 }
      );
    }

    // Verificar que el usuario actual no tenga ya pareja
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
        { error: 'Ya tienes una pareja configurada. No puedes aceptar esta invitación.' },
        { status: 400 }
      );
    }

    // Verificar que no sea el mismo usuario que envió la invitación
    const inviterUser = invitation.couple.users[0];
    if (inviterUser?.id === session.user.id) {
      return NextResponse.json(
        { error: 'No puedes aceptar tu propia invitación' },
        { status: 400 }
      );
    }

    // Verificar que la pareja no esté ya completa
    if (invitation.couple.users.length >= 2) {
      return NextResponse.json(
        { error: 'Esta pareja ya está completa' },
        { status: 400 }
      );
    }

    // Usar transacción para asegurar consistencia
    const result = await prisma.$transaction(async (tx) => {
      // 1. Conectar usuario al perfil de pareja
      await tx.user.update({
        where: { id: session.user.id },
        data: { coupleId: invitation.coupleId }
      });

      // 2. Actualizar nombre del perfil de pareja si es necesario
      const newCoupleName = `${inviterUser?.name?.split(' ')[0] || 'Usuario'} y ${currentUser?.name?.split(' ')[0] || 'Pareja'}`;
      
      await tx.coupleProfile.update({
        where: { id: invitation.coupleId },
        data: { name: newCoupleName }
      });

      // 3. Marcar invitación como usada/inactiva
      await tx.recurringTransaction.update({
        where: { id: invitation.id },
        data: { isActive: false }
      });

      // 4. Crear configuraciones de usuario para el nuevo miembro si no existen
      const existingSettings = await tx.userSettings.findFirst({
        where: { userId: session.user.id }
      });

      if (!existingSettings) {
        await tx.userSettings.create({
          data: {
            userId: session.user.id,
            theme: 'LIGHT',
            language: 'es',
            currency: 'EUR',
            emailNotifications: true,
            pushNotifications: true,
            budgetAlerts: true,
            goalReminders: true,
            shareDataForAnalytics: false,
            chatbotPersonality: 'FRIENDLY'
          }
        });
      }

      return {
        coupleProfile: await tx.coupleProfile.findUnique({
          where: { id: invitation.coupleId },
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
        })
      };
    });

    console.log(`✅ Invitación aceptada: ${session.user.email} se unió a la pareja ${result.coupleProfile?.name}`);

    return NextResponse.json({
      success: true,
      message: '¡Te has unido exitosamente como pareja!',
      coupleProfile: result.coupleProfile,
      redirectTo: '/dashboard?welcome=couple'
    });

  } catch (error) {
    console.error('❌ Error aceptando invitación:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Token de invitación inválido', details: error.errors },
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
 * API para obtener información de una invitación (sin aceptarla)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token requerido' },
        { status: 400 }
      );
    }

    // Buscar la invitación por token
    const invitation = await prisma.recurringTransaction.findFirst({
      where: {
        name: `INVITE_${token}`,
        isActive: true,
        endDate: { gte: new Date() } // No expirada
      },
      include: {
        couple: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitación no válida o expirada' },
        { status: 404 }
      );
    }

    // Verificar que la pareja no esté ya completa
    if (invitation.couple.users.length >= 2) {
      return NextResponse.json(
        { error: 'Esta invitación ya no está disponible' },
        { status: 400 }
      );
    }

    const inviterUser = invitation.couple.users[0];

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        token,
        coupleProfile: invitation.couple.name,
        inviterName: inviterUser?.name || 'Usuario',
        inviterEmail: inviterUser?.email,
        inviterAvatar: inviterUser?.avatar,
        expiresAt: invitation.endDate,
        createdAt: invitation.createdAt,
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo información de invitación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 