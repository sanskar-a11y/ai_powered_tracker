import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

/**
 * Habit Input Validation
 */
const createHabitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  goal: z.number().int().positive().optional(),
});

const updateHabitSchema = createHabitSchema.partial().extend({
  isActive: z.boolean().optional(),
  streakCount: z.number().int().nonnegative().optional(),
  bestStreak: z.number().int().nonnegative().optional(),
  totalDays: z.number().int().nonnegative().optional(),
});

/**
 * GET /api/habits
 * Fetch all habits for authenticated user
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

    // Parse query for filtering
    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get('isActive');

    const whereClause: any = { userId: user.id };
    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }

    const habits = await prisma.habit.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      { success: true, data: habits, total: habits.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/habits
 * Create a new habit
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = createHabitSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        description: validatedData.description,
        frequency: validatedData.frequency || 'DAILY',
        icon: validatedData.icon,
        color: validatedData.color,
        goal: validatedData.goal || 1,
      },
    });

    return NextResponse.json(
      { success: true, data: habit, message: 'Habit created successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating habit:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
