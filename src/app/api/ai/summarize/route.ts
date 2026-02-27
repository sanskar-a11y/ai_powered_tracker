import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklySummary } from '@/lib/gemini';
import { AIWeeklySummarySchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tasksCompleted, focusMinutes, topHabit, topStreakDays } = body;

    if (!tasksCompleted || !focusMinutes) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const summary = await generateWeeklySummary(
      tasksCompleted,
      focusMinutes,
      topHabit || null,
      topStreakDays || 0
    );

    // Validate response
    AIWeeklySummarySchema.parse(summary);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Summarize API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate summary',
      },
      { status: 500 }
    );
  }
}
