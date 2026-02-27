import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

/**
 * Focus Session Update Validation
 */
const updateSessionSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  duration: z.number().int().positive().optional(),
  focusMode: z.string().optional(),
  notes: z.string().optional(),
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional().nullable(),
  isCompleted: z.boolean().optional(),
  distractions: z.number().int().non_negative().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * GET /api/focus-sessions/[id]
 * Fetch a single focus session
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

    const session = await prisma.focusSession.findUnique({
      where: { id: params.id },
    });

    if (!session || session.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Focus session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: session },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching focus session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/focus-sessions/[id]
 * Update a focus session
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
    const validatedData = updateSessionSchema.parse(body);

    const session = await prisma.focusSession.findUnique({
      where: { id: params.id },
    });

    if (!session || session.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Focus session not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.focusSession.update({
      where: { id: params.id },
      data: {
        title: validatedData.title,
        duration: validatedData.duration,
        focusMode: validatedData.focusMode,
        notes: validatedData.notes,
        startedAt: validatedData.startedAt
          ? new Date(validatedData.startedAt)
          : undefined,
        endedAt: validatedData.endedAt
          ? new Date(validatedData.endedAt)
          : validatedData.endedAt === null
          ? null
          : undefined,
        isCompleted: validatedData.isCompleted,
        distractions: validatedData.distractions,
        tags: validatedData.tags,
      },
    });

    return NextResponse.json(
      { success: true, data: updated, message: 'Focus session updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating focus session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/focus-sessions/[id]
 * Delete a focus session
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

    const session = await prisma.focusSession.findUnique({
      where: { id: params.id },
    });

    if (!session || session.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Focus session not found' },
        { status: 404 }
      );
    }

    await prisma.focusSession.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { success: true, message: 'Focus session deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting focus session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
