'use client';

import React from 'react';
import { formatDate, daysUntilDeadline, isOverdue } from '@/utils/formatting';
import Card from '@/components/global/Card';
import Badge from '@/components/global/Badge';
import Button from '@/components/global/Button';
import type { TaskCardProps } from '@/types';

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onToggle }) => {
  const days = task.deadline ? daysUntilDeadline(task.deadline) : null;
  const overdue = task.deadline ? isOverdue(task.deadline) : false;

  const getDeadlineDisplay = () => {
    if (!task.deadline) return null;
    if (overdue) return { text: 'Overdue', color: 'text-red-400' };
    if (days === 0) return { text: 'Today', color: 'text-orange-400' };
    if (days === 1) return { text: 'Tomorrow', color: 'text-yellow-400' };
    return { text: `${days}d left`, color: 'text-gray-400' };
  };

  const deadlineDisplay = getDeadlineDisplay();

  return (
    <Card className="flex items-start justify-between hover:border-gray-700 transition-colors" hover>
      <div className="flex items-start gap-4 flex-1">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={(e) => onToggle?.(task.id, e.target.checked)}
          className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-800 cursor-pointer accent-blue-600"
        />

        {/* Content */}
        <div className="flex-1">
          <h3
            className={`font-medium text-base ${
              task.completed ? 'line-through text-gray-500' : 'text-gray-200'
            }`}
          >
            {task.title}
          </h3>

          <div className="flex items-center gap-2 mt-2">
            <Badge variant="priority" priority={task.priority}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>

            {deadlineDisplay && <span className={`text-xs ${deadlineDisplay.color}`}>{deadlineDisplay.text}</span>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-4">
        <Button variant="ghost" size="sm" onClick={() => onEdit?.(task)}>
          ✎
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete?.(task.id)} className="text-red-400">
          ✕
        </Button>
      </div>
    </Card>
  );
};

export default TaskCard;
