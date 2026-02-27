import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/auth/sync-user
 * Syncs Clerk user with Prisma database
 * Creates or updates user record on first login
 */
export async function POST(req: Request) {
  try {
    // Verify request is from authenticated Clerk user
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { clerkId, email, name, avatar } = body;

    // Validate required fields
    if (!clerkId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the clerkId matches authenticated user
    if (clerkId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Upsert user (create if doesn't exist, update if exists)
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {
        email,
        name: name || undefined,
        avatar: avatar || undefined,
      },
      create: {
        clerkId,
        email,
        name: name || null,
        avatar: avatar || null,
      },
    });

    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    );
  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
