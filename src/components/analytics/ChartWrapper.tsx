'use client';

import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import Card from '@/components/global/Card';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

interface ChartWrapperProps {
  title: string;
  type: 'line' | 'bar';
  data: any;
  options?: any;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({ title, type, data, options }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: '#2a2a2a',
        },
        ticks: {
          color: '#9ca3af',
        },
      },
      y: {
        grid: {
          color: '#2a2a2a',
        },
        ticks: {
          color: '#9ca3af',
        },
      },
    },
  };

  const ChartComponent = type === 'line' ? Line : Bar;

  return (
    <Card>
      <h3 className="font-semibold text-lg text-gray-200 mb-4">{title}</h3>
      <div className="h-80">
        <ChartComponent data={data} options={{ ...defaultOptions, ...options }} />
      </div>
    </Card>
  );
};

// Task per day chart
export const TasksPerDayChart: React.FC<{ data: number[] }> = ({ data }) => {
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  return <ChartWrapper title="Tasks Per Day" type="line" data={chartData} />;
};

// Focus time per week chart
export const FocusPerWeekChart: React.FC<{ data: number[] }> = ({ data }) => {
  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Focus Minutes',
        data: data,
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 1,
      },
    ],
  };

  return <ChartWrapper title="Focus Time Per Week" type="bar" data={chartData} />;
};

// Habit consistency chart
export const HabitConsistencyChart: React.FC<{ data: number[] }> = ({ data }) => {
  const chartData = {
    labels: ['Habit 1', 'Habit 2', 'Habit 3', 'Habit 4', 'Habit 5'],
    datasets: [
      {
        label: 'Consistency %',
        data: data,
        backgroundColor: '#8b5cf6',
        borderColor: '#7c3aed',
      },
    ],
  };

  return <ChartWrapper title="Habit Consistency" type="bar" data={chartData} />;
};

export default ChartWrapper;
