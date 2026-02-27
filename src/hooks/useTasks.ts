'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/useToast'; // We'll create this if needed

type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: string;
  tags: string[];
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

interface UseTasksOptions {
  status?: string;
  priority?: string;
  category?: string;
}

/**
 * Custom hook to manage tasks
 * Handles fetching, creating, updating, and deleting tasks
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks with optional filters
  const fetchTasks = useCallback(async (options?: UseTasksOptions) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options?.status) params.append('status', options.status);
      if (options?.priority) params.append('priority', options.priority);
      if (options?.category) params.append('category', options.category);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      const data = await res.json();

      if (!data.success) throw new Error(data.error);
      setTasks(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new task
  const createTask = useCallback(
    async (taskData: Partial<Task>) => {
      try {
        setError(null);
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        setTasks((prev) => [data.data, ...prev]);
        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create task';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Update a task
  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      try {
        setError(null);
        const res = await fetch(`/api/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        setTasks((prev) =>
          prev.map((task) => (task.id === id ? data.data : task))
        );
        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update task';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Delete a task
  const deleteTask = useCallback(
    async (id: string) => {
      try {
        setError(null);
        const res = await fetch(`/api/tasks/${id}`, {
          method: 'DELETE',
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        setTasks((prev) => prev.filter((task) => task.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete task';
        setError(message);
        throw err;
      }
    },
    []
  );

  return { tasks, isLoading, error, fetchTasks, createTask, updateTask, deleteTask };
}
