import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

/**
 * POST /api/ai/weekly-report
 * Generate an AI-powered weekly productivity report
 * Request body: { weekStart?: string, weekEnd?: string }
 */

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '');

interface WeeklyData {
  tasksCompleted: number;
  habitsCompleted: number;
  totalFocusMinutes: number;
  avgProductivityScore: number;
  dailyBreakdown: Array<{
    date: string;
    tasksCompleted: number;
    habitsCompleted: number;
    focusMinutes: number;
    productivityScore: number;
  }>;
}

export async function POST(req: NextRequest) {
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
      include: { habits: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    let weekStart = body.weekStart ? new Date(body.weekStart) : new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    let weekEnd = body.weekEnd ? new Date(body.weekEnd) : new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Check if report already exists for this week
    const existingReport = await prisma.aiReport.findFirst({
      where: {
        userId: user.id,
        weekStart: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { success: true, data: existingReport, message: 'Report already exists for this week' },
        { status: 200 }
      );
    }

    // Fetch weekly data
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

    const weeklyData: WeeklyData = {
      tasksCompleted: dailyStats.reduce((sum, stat) => sum + stat.tasksCompleted, 0),
      habitsCompleted: dailyStats.reduce((sum, stat) => sum + stat.habitsCompleted, 0),
      totalFocusMinutes: dailyStats.reduce((sum, stat) => sum + stat.focusMinutes, 0),
      avgProductivityScore:
        dailyStats.length > 0
          ? dailyStats.reduce((sum, stat) => sum + stat.productivityScore, 0) /
            dailyStats.length
          : 0,
      dailyBreakdown: dailyStats.map((stat) => ({
        date: stat.date.toISOString().split('T')[0],
        tasksCompleted: stat.tasksCompleted,
        habitsCompleted: stat.habitsCompleted,
        focusMinutes: stat.focusMinutes,
        productivityScore: stat.productivityScore,
      })),
    };

    // Generate AI report using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Based on the following weekly productivity data, generate a professional AI-powered productivity report.

User: ${user.name || 'Productivity Tracker User'}
Week: ${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}

Weekly Statistics:
- Tasks Completed: ${weeklyData.tasksCompleted}
- Habits Completed: ${weeklyData.habitsCompleted}
- Total Focus Hours: ${(weeklyData.totalFocusMinutes / 60).toFixed(1)}
- Average Productivity Score: ${Math.round(weeklyData.avgProductivityScore)}/100
- Number of Active Habits: ${user.habits.length}

Daily Breakdown:
${weeklyData.dailyBreakdown.map((day) => `${day.date}: ${day.tasksCompleted} tasks, ${day.habitsCompleted} habits, ${day.focusMinutes}min focus, ${day.productivityScore}/100 score`).join('\n')}

Please provide a structured AI analysis in the following JSON format (ONLY JSON, no markdown):
{
  "summary": "A brief 2-3 sentence overall summary of the week's productivity",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["area_to_improve_1", "area_to_improve_2", "area_to_improve_3"],
  "suggestions": ["actionable_suggestion_1", "actionable_suggestion_2", "actionable_suggestion_3"]
}

Requirements:
- Return ONLY valid JSON
- No markdown formatting
- No code blocks
- No extra text`;

    const response = await model.generateContent(prompt);
    const aiText = response.response.text();

    // Parse AI response
    let aiData;
    try {
      // Clean the response in case it has markdown
      let cleanText = aiText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      aiData = JSON.parse(cleanText);
    } catch (e) {
      console.error('Failed to parse AI response:', aiText);
      aiData = {
        summary: 'Weekly productivity report generated.',
        strengths: ['Tracked weekly activities'],
        improvements: ['Review daily patterns'],
        suggestions: ['Maintain consistency'],
      };
    }

    // Save report to database
    const report = await prisma.aiReport.create({
      data: {
        userId: user.id,
        weekStart,
        weekEnd,
        summary: aiData.summary || '',
        strengths: Array.isArray(aiData.strengths) ? aiData.strengths : [],
        improvements: Array.isArray(aiData.improvements) ? aiData.improvements : [],
        suggestions: Array.isArray(aiData.suggestions) ? aiData.suggestions : [],
        productivityScore: weeklyData.avgProductivityScore,
        totalFocusHours: weeklyData.totalFocusMinutes / 60,
        habitsCompleted: weeklyData.habitsCompleted,
        tasksCompleted: weeklyData.tasksCompleted,
      },
    });

    return NextResponse.json(
      { success: true, data: report, message: 'Weekly report generated successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error generating weekly report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/weekly-report
 * Fetch the latest AI report for the user
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

    const latestReport = await prisma.aiReport.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (!latestReport) {
      return NextResponse.json(
        { success: true, data: null, message: 'No reports generated yet' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, data: latestReport },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching AI report:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
