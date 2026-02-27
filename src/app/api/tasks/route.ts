import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

/**
 * Task Input Validation
 */
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dueDate: z.string().datetime().optional(),
});

const updateTaskSchema = createTaskSchema.partial();

type CreateTaskInput = z.infer<typeof createTaskSchema>;
type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

/**
 * GET /api/tasks
 * Fetch all tasks for authenticated user with optional filters
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

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');

    // Build filter conditions
    const whereClause: any = { userId: user.id };
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (category) whereClause.category = category;

    // Fetch tasks
    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      { success: true, data: tasks, total: tasks.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Create a new task
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

    // Validate input
    const validatedData = createTaskSchema.parse(body);

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

    // Create task
    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority || 'MEDIUM',
        status: validatedData.status || 'TODO',
        category: validatedData.category,
        tags: validatedData.tags || [],
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      },
    });

    return NextResponse.json(
      { success: true, data: task, message: 'Task created successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
