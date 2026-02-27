import { NextRequest, NextResponse } from 'next/server';
import { generateGoalPlan } from '@/lib/gemini';
import { AIGoalPlanSchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goal, context } = body;

    if (!goal) {
      return NextResponse.json(
        { success: false, error: 'Goal is required' },
        { status: 400 }
      );
    }

    const plan = await generateGoalPlan(goal, context);

    // Validate response
    AIGoalPlanSchema.parse(plan);

    return NextResponse.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Plan API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate plan',
      },
      { status: 500 }
    );
  }
}
