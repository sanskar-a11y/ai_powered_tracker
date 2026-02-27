import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/analytics/weekly
 * Fetch weekly stats and AI report if available
 * Query params: ?week=0 (0=this week, 1=last week, etc)
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const weekOffset = parseInt(searchParams.get('week') || '0');

    // Calculate week start and end
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() - weekOffset * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Fetch daily stats for the week
    const dailyStats = await prisma.dailyStats.findMany({
      where: {
        userId: user.id,
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Calculate weekly aggregates
    const totalTasksCompleted = dailyStats.reduce(
      (sum, stat) => sum + stat.tasksCompleted,
      0
    );
    const totalHabitsCompleted = dailyStats.reduce(
      (sum, stat) => sum + stat.habitsCompleted,
      0
    );
    const totalFocusMinutes = dailyStats.reduce(
      (sum, stat) => sum + stat.focusMinutes,
      0
    );
    const avgProductivityScore =
      dailyStats.length > 0
        ? dailyStats.reduce((sum, stat) => sum + stat.productivityScore, 0) /
          dailyStats.length
        : 0;

    // Fetch AI report if exists (only for past weeks)
    let aiReport = null;
    if (weekOffset > 0) {
      aiReport = await prisma.aiReport.findFirst({
        where: {
          userId: user.id,
          weekStart: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          weekStart,
          weekEnd,
          dailyStats,
          aggregates: {
            totalTasksCompleted,
            totalHabitsCompleted,
            totalFocusHours: Math.round(totalFocusMinutes / 60),
            avgProductivityScore: Math.round(avgProductivityScore),
            daysActive: dailyStats.length,
          },
          aiReport,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching weekly analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
