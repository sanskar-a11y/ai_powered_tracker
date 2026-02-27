import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

/**
 * Task Update Validation
 */
const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),
});

/**
 * GET /api/tasks/[id]
 * Fetch a single task by ID
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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch task (must belong to the user)
    const task = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!task || task.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: task },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tasks/[id]
 * Update a task
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
    const validatedData = updateTaskSchema.parse(body);

    // Check task belongs to user
    const task = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!task || task.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Update task
    const updated = await prisma.task.update({
      where: { id: params.id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        status: validatedData.status,
        category: validatedData.category,
        tags: validatedData.tags,
        dueDate: validatedData.dueDate
          ? new Date(validatedData.dueDate)
          : undefined,
        completedAt: validatedData.completedAt
          ? new Date(validatedData.completedAt)
          : validatedData.completedAt === null
          ? null
          : undefined,
      },
    });

    return NextResponse.json(
      { success: true, data: updated, message: 'Task updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]
 * Delete a task
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

    // Check task belongs to user
    const task = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!task || task.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Delete task
    await prisma.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { success: true, message: 'Task deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
