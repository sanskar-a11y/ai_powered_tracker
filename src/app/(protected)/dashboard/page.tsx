'use client';

import { useState } from 'react';
import StatCard from '@/components/global/StatCard';
import Card from '@/components/global/Card';
import Button from '@/components/global/Button';
import TaskList from '@/components/tasks/TaskList';
import type { Task } from '@/types';

// Mock data
const mockTasks: Task[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'Complete project proposal',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    priority: 'high',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Review team feedback',
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    userId: 'user1',
    title: 'Update documentation',
    priority: 'low',
    completed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function Dashboard() {
  const [tasks] = useState<Task[]>(mockTasks);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's your productivity overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tasks Completed" value="12" trend={20} icon="✓" />
        <StatCard label="Pending Tasks" value="5" trend={-10} icon="📋" />
        <StatCard label="Current Streak" value="7 days" trend={14} icon="🔥" />
        <StatCard label="Focus Minutes" value="245" trend={8} icon="⏱️" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Tasks */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Today's Tasks</h2>
            <Button variant="primary" size="sm">
              + Add Task
            </Button>
          </div>
          <TaskList tasks={tasks.slice(0, 2)} />
        </div>

        {/* Pomodoro Timer */}
        <Card>
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <h3 className="text-lg font-semibold text-white">Focus Timer</h3>

            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#2a2a2a"
                  strokeWidth="4"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  strokeDasharray={`${(25 / 25) * 2 * Math.PI * 70} ${2 * Math.PI * 70}`}
                />
              </svg>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400">25:00</div>
                <p className="text-xs text-gray-400 mt-1">Ready</p>
              </div>
            </div>

            <Button variant="primary" size="lg">
              Start Session
            </Button>
          </div>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-lg text-white mb-4">Weekly Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Tasks completed this week</span>
              <span className="font-semibold text-white">12/15</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Average focus time</span>
              <span className="font-semibold text-white">3h 45m</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Longest habit streak</span>
              <span className="font-semibold text-white">Morning Workout (7 days)</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-lg text-white mb-4">AI Insights</h3>
          <Button variant="primary" size="lg" className="w-full">
            📊 Generate Summary
          </Button>
        </Card>
      </div>
    </div>
  );
}
