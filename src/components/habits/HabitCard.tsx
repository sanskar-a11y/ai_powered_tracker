'use client';

import React from 'react';
import Card from '@/components/global/Card';
import Button from '@/components/global/Button';
import type { HabitCardProps } from '@/types';

const StreakDisplay: React.FC<{ current: number; longest: number }> = ({ current, longest }) => {
  // Subtle glow for streaks > 5
  const showGlow = current > 5;

  return (
    <div className="space-y-2">
      <div className={`flex items-center gap-2 ${showGlow ? 'drop-shadow-lg' : ''}`}>
        <span className="text-2xl">🔥</span>
        <div>
          <p className="text-xs text-gray-400">Current Streak</p>
          <p className={`text-2xl font-bold ${showGlow ? 'text-orange-400' : 'text-gray-200'}`}>
            {current}
          </p>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Longest: <span className="text-gray-300 font-semibold">{longest}</span> days
      </div>
    </div>
  );
};

const HabitCard: React.FC<HabitCardProps> = ({ habit, onComplete, onDelete }) => {
  return (
    <Card className="flex flex-col justify-between h-full" hover>
      <div>
        <h3 className="font-semibold text-lg text-gray-200 mb-4">{habit.name}</h3>
        <StreakDisplay current={habit.currentStreak} longest={habit.longestStreak} />
      </div>

      <div className="flex gap-2 mt-6 pt-4 border-t border-gray-800">
        <Button variant="primary" size="sm" className="flex-1" onClick={onComplete}>
          ✓ Complete
        </Button>
        <Button variant="danger" size="sm" onClick={onDelete}>
          ✕
        </Button>
      </div>
    </Card>
  );
};

export default HabitCard;
export { StreakDisplay };
