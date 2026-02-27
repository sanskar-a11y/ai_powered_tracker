'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

/**
 * Hook to sync Clerk user with Prisma database
 * Creates user record on first login
 */
export function useSyncUser() {
  const { user, isLoaded } = useUser();
  const [isSync, setIsSync] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const syncUser = async () => {
      try {
        setIsSync(true);
        setError(null);

        const response = await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName,
            avatar: user.imageUrl,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to sync user');
        }

        setIsSync(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('User sync error:', message);
        setError(message);
        setIsSync(false);
      }
    };

    syncUser();
  }, [user, isLoaded]);

  return { isSync, error };
}
