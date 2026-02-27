'use client';

import Card from '@/components/global/Card';
import Button from '@/components/global/Button';
import { TasksPerDayChart, FocusPerWeekChart, HabitConsistencyChart } from '@/components/analytics/ChartWrapper';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1">Track your productivity trends</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-gray-400">This Week Tasks</p>
          <p className="text-3xl font-bold text-white mt-2">18</p>
          <p className="text-xs text-green-400 mt-2">↑ 12% from last week</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400">Total Focus Hours</p>
          <p className="text-3xl font-bold text-white mt-2">18.5h</p>
          <p className="text-xs text-green-400 mt-2">↑ 25% from last week</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400">Habits Completed</p>
          <p className="text-3xl font-bold text-white mt-2">24/28</p>
          <p className="text-xs text-yellow-400 mt-2">↓ 5% from last week</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400">Avg Streak</p>
          <p className="text-3xl font-bold text-white mt-2">8.2</p>
          <p className="text-xs text-green-400 mt-2">↑ 3% from last week</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        <TasksPerDayChart data={[5, 8, 6, 9, 12, 7, 8]} />
        <FocusPerWeekChart data={[180, 240, 210, 300]} />
        <HabitConsistencyChart data={[92, 85, 88, 79, 95]} />
      </div>

      {/* Bottom Section */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-white">Get AI Insights</h3>
            <p className="text-gray-400 text-sm mt-1">Get AI-powered recommendations based on your analytics</p>
          </div>
          <Button variant="primary">
            Generate Report
          </Button>
        </div>
      </Card>
    </div>
  );
}
