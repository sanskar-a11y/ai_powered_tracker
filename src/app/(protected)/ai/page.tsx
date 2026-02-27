'use client';

import { useState } from 'react';
import Card from '@/components/global/Card';
import Loader from '@/components/global/Loader';
import {
  AIActionButtons,
  AISummaryCard,
  AIPlanCard,
  AIOptimizationCard,
} from '@/components/ai/AIComponents';
import type { AIWeeklySummary, AIGoalPlan, AIHabitOptimization } from '@/types';

type AIResultType = 'summary' | 'plan' | 'optimization' | null;

export default function AIPage() {
  const [loading, setLoading] = useState(false);
  const [resultType, setResultType] = useState<AIResultType>(null);
  const [summaryData, setSummaryData] = useState<AIWeeklySummary | null>(null);
  const [planData, setPlanData] = useState<AIGoalPlan | null>(null);
  const [optimizationData, setOptimizationData] = useState<AIHabitOptimization | null>(null);
  const [goal, setGoal] = useState('');

  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          tasksCompleted: 12,
          focusMinutes: 245,
          topHabit: 'Morning Workout',
          topStreakDays: 7,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSummaryData(data.data);
        setResultType('summary');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanGoal = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ goal, context: 'User wants to improve productivity' }),
      });
      const data = await response.json();
      if (data.success) {
        setPlanData(data.data);
        setResultType('plan');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeHabits = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          habitName: 'Morning Workout',
          currentStreak: 12,
          context: 'Building consistent morning exercise routine',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setOptimizationData(data.data);
        setResultType('optimization');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">AI Assistant</h1>
        <p className="text-gray-400 mt-1">Get personalized AI insights and recommendations</p>
      </div>

      {/* Introduction */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <span className="text-4xl">🤖</span>
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Your Personalized AI Assistant</h2>
              <p className="text-gray-400">
                This AI assistant analyzes your productivity data and provides actionable insights to help you
                optimize your workflow, build better habits, and achieve your goals.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <AIActionButtons
        onSummarize={handleGenerateSummary}
        onPlanGoal={() => setResultType('plan')}
        onOptimizeHabits={handleOptimizeHabits}
        loading={loading}
      />

      {/* Goal Input (for Plan Goal) */}
      {resultType === 'plan' && (
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">What's your goal?</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Learn React in 30 days"
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handlePlanGoal}
              disabled={!goal.trim() || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Planning...' : 'Plan'}
            </button>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="flex items-center justify-center py-16">
          <Loader size="lg" text="AI is thinking..." />
        </Card>
      )}

      {/* Results */}
      {!loading && summaryData && resultType === 'summary' && <AISummaryCard data={summaryData} />}
      {!loading && planData && resultType === 'plan' && <AIPlanCard data={planData} />}
      {!loading && optimizationData && resultType === 'optimization' && (
        <AIOptimizationCard data={optimizationData} />
      )}

      {/* Call to Action */}
      {!resultType && !loading && (
        <Card className="text-center py-12">
          <p className="text-gray-400 mb-4">Click any button above to get started with AI insights!</p>
          <p className="text-sm text-gray-500">Your data is analyzed securely on our servers</p>
        </Card>
      )}
    </div>
  );
}
