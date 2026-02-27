'use client';

import { useState, useCallback } from 'react';

type Habit = {
  id: string;
  name: string;
  description?: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  icon?: string;
  color?: string;
  goal: number;
  streakCount: number;
  bestStreak: number;
  totalDays: number;
  isActive: boolean;
  lastLoggedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Custom hook to manage habits
 */
export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async (isActive?: boolean) => {
    try {
      setIsLoading(true);
      setError(null);

      let url = '/api/habits';
      if (isActive !== undefined) {
        url += `?isActive=${isActive}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!data.success) throw new Error(data.error);
      setHabits(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch habits';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createHabit = useCallback(
    async (habitData: Partial<Habit>) => {
      try {
        setError(null);
        const res = await fetch('/api/habits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(habitData),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        setHabits((prev) => [data.data, ...prev]);
        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create habit';
        setError(message);
        throw err;
      }
    },
    []
  );

  const updateHabit = useCallback(
    async (id: string, updates: Partial<Habit>) => {
      try {
        setError(null);
        const res = await fetch(`/api/habits/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        setHabits((prev) =>
          prev.map((habit) => (habit.id === id ? data.data : habit))
        );
        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update habit';
        setError(message);
        throw err;
      }
    },
    []
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      try {
        setError(null);
        const res = await fetch(`/api/habits/${id}`, {
          method: 'DELETE',
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        setHabits((prev) => prev.filter((habit) => habit.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete habit';
        setError(message);
        throw err;
      }
    },
    []
  );

  return { habits, isLoading, error, fetchHabits, createHabit, updateHabit, deleteHabit };
}
