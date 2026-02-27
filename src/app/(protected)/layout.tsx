'use client';

import { ReactNode } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useSyncUser } from '@/hooks/useSyncUser';

/**
 * Protected Layout - Client Component (with Server-side auth backing)
 * 
 * This layout:
 * 1. Verifies authentication client-side using Clerk hook
 * 2. Syncs Clerk user to Prisma database on every protected page load
 * 3. Prevents unauthenticated access with redirect pattern
 * 
 * Why we use useSyncUser here:
 * - Ensures every authenticated user exists in the database
 * - Syncs on first login and on user profile updates
 * - Prevents dashboard stats from being corrupted by missing users
 */
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useClerk();
  const { isSync, error } = useSyncUser();

  // Redirect if not loaded or not signed in
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    // Redirect will happen via middleware, but provide fallback
    throw new Error('Unauthorized');
  }

  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
}
