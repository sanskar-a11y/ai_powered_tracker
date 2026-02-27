import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/analytics/daily
 * Fetch daily stats for a specified date range
 * Query params: ?from=2024-01-01&to=2024-01-31
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
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const days = searchParams.get('days') || '7'; // Default to last 7 days

    let startDate: Date;
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    if (from && to) {
      startDate = new Date(from);
      endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default to last N days
      startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      startDate.setHours(0, 0, 0, 0);
    }

    // Fetch daily stats from pre-aggregated table
    const dailyStats = await prisma.dailyStats.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Calculate aggregates
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

    return NextResponse.json(
      {
        success: true,
        data: {
          dailyStats,
          aggregates: {
            totalTasksCompleted,
            totalHabitsCompleted,
            totalFocusMinutes,
            avgProductivityScore: Math.round(avgProductivityScore),
            daysTracked: dailyStats.length,
          },
          dateRange: { startDate, endDate },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching daily analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
