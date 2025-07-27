import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/dashboard/stats - Obtener estadísticas financieras del usuario
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // month, quarter, year
    
    // Calcular fechas del período
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Último día del mes

    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        endDate = now;
        break;
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        endDate = new Date(now.getFullYear(), quarterStart + 3, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Ejecutar consultas en paralelo
    const [
      transactionStats,
      categoryBreakdown,
      recentTransactions,
      budgetStats,
      savingsGoals,
      monthlyTrends
    ] = await Promise.all([
      // Estadísticas básicas de transacciones
      prisma.transaction.groupBy({
        by: ['type'],
        where: {
          userId: session.user.id,
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Desglose por categorías
      prisma.transaction.groupBy({
        by: ['categoryId', 'type'],
        where: {
          userId: session.user.id,
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Transacciones recientes
      prisma.transaction.findMany({
        where: { userId: session.user.id },
        include: {
          category: true,
        },
        orderBy: { date: 'desc' },
        take: 5,
      }),

      // Estadísticas de presupuestos
      prisma.budget.findMany({
        where: {
          couple: {
            users: { some: { id: session.user.id } }
          },
          isActive: true,
          startDate: { lte: endDate },
          OR: [
            { endDate: null },
            { endDate: { gte: startDate } }
          ],
        },
        include: {
          category: true,
        },
      }),

      // Objetivos de ahorro
      prisma.savingsGoal.findMany({
        where: {
          couple: {
            users: { some: { id: session.user.id } }
          },
        },
        include: {
          contributions: {
            where: {
              userId: session.user.id,
              date: { gte: startDate, lte: endDate },
            },
          },
        },
      }),

      // Tendencias mensuales (últimos 6 meses)
      prisma.$queryRaw`
        SELECT 
          strftime('%Y-%m', date) as month,
          type,
          SUM(amount) as total
        FROM Transaction 
        WHERE userId = ${session.user.id}
          AND date >= date('now', '-6 months')
        GROUP BY strftime('%Y-%m', date), type
        ORDER BY month DESC
      `
    ]);

    // Procesar estadísticas básicas
    const income = transactionStats.find(t => t.type === 'INCOME')?._sum.amount || 0;
    const expenses = transactionStats.find(t => t.type === 'EXPENSE')?._sum.amount || 0;
    const netBalance = income - expenses;
    const transactionCount = transactionStats.reduce((acc, t) => acc + t._count.id, 0);

    // Procesar categorías con nombres
    const categoriesWithNames = await prisma.category.findMany({
      where: {
        id: { in: categoryBreakdown.map(c => c.categoryId) }
      },
    });

    const processedCategoryBreakdown = categoryBreakdown.map(item => {
      const category = categoriesWithNames.find(c => c.id === item.categoryId);
      return {
        categoryId: item.categoryId,
        categoryName: category?.name || 'Desconocida',
        categoryIcon: category?.icon || 'help-circle',
        categoryColor: category?.color || '#6B7280',
        type: item.type,
        amount: item._sum.amount || 0,
        count: item._count.id,
        percentage: item.type === 'EXPENSE' ? 
          ((item._sum.amount || 0) / expenses * 100) : 
          ((item._sum.amount || 0) / income * 100),
      };
    });

    // Calcular progreso de presupuestos
    const budgetProgress = await Promise.all(
      budgetStats.map(async (budget) => {
        const spent = await prisma.transaction.aggregate({
          where: {
            userId: session.user.id,
            categoryId: budget.category.id,
            type: 'EXPENSE',
            date: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        });

        const spentAmount = spent._sum.amount || 0;
        const percentage = (spentAmount / budget.amount) * 100;

        return {
          id: budget.id,
          name: budget.name,
          amount: budget.amount,
          spent: spentAmount,
          remaining: budget.amount - spentAmount,
          percentage,
          isOverBudget: percentage > 100,
          category: budget.category,
        };
      })
    );

    // Calcular progreso de objetivos de ahorro
    const savingsProgress = savingsGoals.map(goal => {
      const periodContributions = goal.contributions.reduce(
        (sum, contrib) => sum + contrib.amount, 0
      );
      const percentage = (goal.currentAmount / goal.targetAmount) * 100;

      return {
        id: goal.id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        percentage,
        contributionsThisMonth: periodContributions,
        isCompleted: goal.isCompleted,
        priority: goal.priority,
      };
    });

    // Preparar respuesta
    const dashboardStats = {
      summary: {
        totalIncome: income,
        totalExpenses: expenses,
        netBalance,
        transactionCount,
        savingsRate: income > 0 ? ((income - expenses) / income * 100) : 0,
      },
      categoryBreakdown: processedCategoryBreakdown,
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        amount: t.amount,
        description: t.description,
        type: t.type,
        date: t.date,
        category: {
          name: t.category.name,
          icon: t.category.icon,
          color: t.category.color,
        },
      })),
      budgets: budgetProgress,
      savingsGoals: savingsProgress,
      monthlyTrends: monthlyTrends,
      period: {
        type: period,
        startDate,
        endDate,
      },
    };

    return NextResponse.json({
      success: true,
      data: dashboardStats,
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 