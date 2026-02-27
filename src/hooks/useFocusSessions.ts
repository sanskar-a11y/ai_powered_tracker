'use client';

import { useState, useCallback } from 'react';

type FocusSession = {
  id: string;
  title: string;
  duration: number;
  focusMode: string;
  startedAt: Date;
  endedAt?: Date;
  notes?: string;
  isCompleted: boolean;
  distractions: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Custom hook to manage focus sessions
 */
export function useFocusSessions() {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async (isCompleted?: boolean) => {
    try {
      setIsLoading(true);
      setError(null);

      let url = '/api/focus-sessions';
      if (isCompleted !== undefined) {
        url += `?isCompleted=${isCompleted}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!data.success) throw new Error(data.error);
      setSessions(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch focus sessions';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSession = useCallback(
    async (sessionData: Partial<FocusSession>) => {
      try {
        setError(null);
        const res = await fetch('/api/focus-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        setSessions((prev) => [data.data, ...prev]);
        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create focus session';
        setError(message);
        throw err;
      }
    },
    []
  );

  const updateSession = useCallback(
    async (id: string, updates: Partial<FocusSession>) => {
      try {
        setError(null);
        const res = await fetch(`/api/focus-sessions/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        setSessions((prev) =>
          prev.map((session) => (session.id === id ? data.data : session))
        );
        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update focus session';
        setError(message);
        throw err;
      }
    },
    []
  );

  const deleteSession = useCallback(
    async (id: string) => {
      try {
        setError(null);
        const res = await fetch(`/api/focus-sessions/${id}`, {
          method: 'DELETE',
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        setSessions((prev) => prev.filter((session) => session.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete focus session';
        setError(message);
        throw err;
      }
    },
    []
  );

  return { sessions, isLoading, error, fetchSessions, createSession, updateSession, deleteSession };
}
