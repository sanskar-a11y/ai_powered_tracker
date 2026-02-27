import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

/**
 * Focus Session Input Validation
 */
const createSessionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  duration: z.number().int().positive('Duration must be positive'),
  focusMode: z.string().optional(),
  notes: z.string().optional(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

const updateSessionSchema = createSessionSchema.partial().extend({
  isCompleted: z.boolean().optional(),
  distractions: z.number().int().non_negative().optional(),
});

/**
 * GET /api/focus-sessions
 * Fetch all focus sessions for authenticated user
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
    const isCompleted = searchParams.get('isCompleted');
    const orderBy = searchParams.get('orderBy') || 'startedAt';

    const whereClause: any = { userId: user.id };
    if (isCompleted !== null) {
      whereClause.isCompleted = isCompleted === 'true';
    }

    const sessions = await prisma.focusSession.findMany({
      where: whereClause,
      orderBy: { [orderBy]: 'desc' },
    });

    return NextResponse.json(
      { success: true, data: sessions, total: sessions.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching focus sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/focus-sessions
 * Create a new focus session
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
    const validatedData = createSessionSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const session = await prisma.focusSession.create({
      data: {
        userId: user.id,
        title: validatedData.title,
        duration: validatedData.duration,
        focusMode: validatedData.focusMode || 'Deep Work',
        notes: validatedData.notes,
        startedAt: new Date(validatedData.startedAt),
        endedAt: validatedData.endedAt ? new Date(validatedData.endedAt) : null,
        tags: validatedData.tags || [],
      },
    });

    return NextResponse.json(
      { success: true, data: session, message: 'Focus session created successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating focus session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
