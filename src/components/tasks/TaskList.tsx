'use client';

import React from 'react';
import TaskCard from './TaskCard';
import EmptyState from '@/components/global/EmptyState';
import type { Task } from '@/types';

interface TaskListProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onToggle?: (taskId: string, completed: boolean) => void;
  loading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onEdit, onDelete, onToggle, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks yet"
        description="Create your first task to get started"
        icon="📝"
        action={{
          label: 'Create Task',
          onClick: () => onEdit?.(undefined as any),
        }}
      />
    );
  }

  // Sort: incomplete first, then by priority
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-3">
      {sortedTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
};

export default TaskList;
