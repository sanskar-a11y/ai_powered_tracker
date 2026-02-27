'use client';

import React from 'react';
import HabitCard from './HabitCard';
import EmptyState from '@/components/global/EmptyState';
import type { Habit } from '@/types';

interface HabitGridProps {
  habits: Habit[];
  onComplete?: (habitId: string) => void;
  onDelete?: (habitId: string) => void;
  loading?: boolean;
}

const HabitGrid: React.FC<HabitGridProps> = ({ habits, onComplete, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <EmptyState
        title="No habits yet"
        description="Start building better habits today"
        icon="🌱"
        action={{
          label: 'Create Habit',
          onClick: () => {
            // TODO: Open create habit modal
          },
        }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          onComplete={() => onComplete?.(habit.id)}
          onDelete={() => onDelete?.(habit.id)}
        />
      ))}
    </div>
  );
};

export default HabitGrid;
