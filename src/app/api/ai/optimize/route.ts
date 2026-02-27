import { NextRequest, NextResponse } from 'next/server';
import { optimizeHabit } from '@/lib/gemini';
import { AIHabitOptimizationSchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { habitName, currentStreak, context } = body;

    if (!habitName || currentStreak === undefined) {
      return NextResponse.json(
        { success: false, error: 'Habit name and streak are required' },
        { status: 400 }
      );
    }

    const optimization = await optimizeHabit(habitName, currentStreak, context);

    // Validate response
    AIHabitOptimizationSchema.parse(optimization);

    return NextResponse.json({
      success: true,
      data: optimization,
    });
  } catch (error) {
    console.error('Optimize API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate optimization',
      },
      { status: 500 }
    );
  }
}
