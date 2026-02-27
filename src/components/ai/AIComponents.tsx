'use client';

import React from 'react';
import Button from '@/components/global/Button';
import Card from '@/components/global/Card';
import type { AIWeeklySummary, AIGoalPlan, AIHabitOptimization } from '@/types';

// Action Buttons
interface AIActionButtonsProps {
  onSummarize: () => void;
  onPlanGoal: () => void;
  onOptimizeHabits: () => void;
  loading?: boolean;
}

export const AIActionButtons: React.FC<AIActionButtonsProps> = ({
  onSummarize,
  onPlanGoal,
  onOptimizeHabits,
  loading,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Button
        variant="primary"
        size="lg"
        onClick={onSummarize}
        disabled={loading}
        className="h-20 flex flex-col items-center justify-center"
      >
        <span className="text-2xl mb-1">📊</span>
        <span className="text-sm">Summarize My Week</span>
      </Button>

      <Button
        variant="primary"
        size="lg"
        onClick={onPlanGoal}
        disabled={loading}
        className="h-20 flex flex-col items-center justify-center"
      >
        <span className="text-2xl mb-1">🎯</span>
        <span className="text-sm">Plan My Goal</span>
      </Button>

      <Button
        variant="primary"
        size="lg"
        onClick={onOptimizeHabits}
        disabled={loading}
        className="h-20 flex flex-col items-center justify-center"
      >
        <span className="text-2xl mb-1">🔥</span>
        <span className="text-sm">Optimize Habits</span>
      </Button>
    </div>
  );
};

// Weekly Summary Card
export const AISummaryCard: React.FC<{ data: AIWeeklySummary }> = ({ data }) => {
  return (
    <Card>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">📊 Your Weekly Summary</h3>

        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-300 leading-relaxed">{data.summary}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Tasks Completed</p>
            <p className="text-2xl font-bold text-blue-400">{data.tasksCompleted}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Focus Time</p>
            <p className="text-2xl font-bold text-green-400">{data.focusMinutes}m</p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <p className="text-sm text-gray-400 mb-2">Recommendation:</p>
          <p className="text-gray-200 font-medium">{data.recommendation}</p>
        </div>
      </div>
    </Card>
  );
};

// Goal Plan Card
export const AIPlanCard: React.FC<{ data: AIGoalPlan }> = ({ data }) => {
  return (
    <Card>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">🎯 Goal Plan: {data.goal}</h3>

        <div>
          <p className="text-xs text-gray-400 mb-3 font-medium">Action Steps:</p>
          <ol className="space-y-2">
            {data.steps.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="text-blue-400 font-semibold mt-0.5">{idx + 1}.</span>
                <span className="text-gray-300">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-gray-800 rounded-lg p-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Timeline</p>
            <p className="text-gray-200 font-semibold">{data.timeline}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Focus Area</p>
            <p className="text-gray-200 font-semibold">{data.focus}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Habit Optimization Card
export const AIOptimizationCard: React.FC<{ data: AIHabitOptimization }> = ({ data }) => {
  return (
    <Card>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">🔥 Optimize: {data.habit}</h3>

        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Current Streak</p>
          <p className="text-3xl font-bold text-orange-400">{data.currentStreak} days</p>
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-2 font-medium">Suggestion:</p>
          <p className="text-gray-200">{data.suggestion}</p>
        </div>

        <div className="border-t border-gray-700 pt-4 space-y-3">
          <div>
            <p className="text-xs text-gray-400 mb-1 font-medium">💡 Motivation:</p>
            <p className="text-gray-300 italic">{data.motivation}</p>
          </div>

          <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-800">
            <p className="text-xs text-gray-400 mb-1">Next Step Today:</p>
            <p className="text-blue-300 font-semibold">{data.nextStep}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AIActionButtons;
