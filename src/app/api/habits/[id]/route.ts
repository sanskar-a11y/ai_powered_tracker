import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

/**
 * Habit Update Validation
 */
const updateHabitSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  goal: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  streakCount: z.number().int().nonnegative().optional(),
  bestStreak: z.number().int().nonnegative().optional(),
  totalDays: z.number().int().nonnegative().optional(),
});

/**
 * GET /api/habits/[id]
 * Fetch a single habit
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const habit = await prisma.habit.findUnique({
      where: { id: params.id },
    });

    if (!habit || habit.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Habit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: habit },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching habit:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/habits/[id]
 * Update a habit
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await req.json();
    const validatedData = updateHabitSchema.parse(body);

    const habit = await prisma.habit.findUnique({
      where: { id: params.id },
    });

    if (!habit || habit.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Habit not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.habit.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(
      { success: true, data: updated, message: 'Habit updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating habit:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/habits/[id]
 * Delete a habit
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const habit = await prisma.habit.findUnique({
      where: { id: params.id },
    });

    if (!habit || habit.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Habit not found' },
        { status: 404 }
      );
    }

    await prisma.habit.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { success: true, message: 'Habit deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
