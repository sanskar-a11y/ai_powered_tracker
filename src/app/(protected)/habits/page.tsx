'use client';

import { useState } from 'react';
import Button from '@/components/global/Button';
import HabitGrid from '@/components/habits/HabitGrid';
import Card from '@/components/global/Card';
import Input from '@/components/global/Input';
import Modal from '@/components/global/Modal';
import type { Habit } from '@/types';

const mockHabits: Habit[] = [
  {
    id: '1',
    userId: 'user1',
    name: 'Morning Workout',
    currentStreak: 12,
    longestStreak: 45,
    lastCompletedDate: new Date(),
    createdAt: new Date(),
  },
  {
    id: '2',
    userId: 'user1',
    name: 'Read 30 Minutes',
    currentStreak: 7,
    longestStreak: 21,
    lastCompletedDate: new Date(),
    createdAt: new Date(),
  },
  {
    id: '3',
    userId: 'user1',
    name: 'Meditation',
    currentStreak: 5,
    longestStreak: 14,
    lastCompletedDate: new Date(),
    createdAt: new Date(),
  },
  {
    id: '4',
    userId: 'user1',
    name: 'Drink 8 Glasses Water',
    currentStreak: 3,
    longestStreak: 8,
    lastCompletedDate: new Date(),
    createdAt: new Date(),
  },
];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>(mockHabits);
  const [showModal, setShowModal] = useState(false);

  const handleComplete = (id: string) => {
    setHabits(
      habits.map((h) =>
        h.id === id
          ? {
              ...h,
              currentStreak: h.currentStreak + 1,
              lastCompletedDate: new Date(),
            }
          : h
      )
    );
  };

  const handleDelete = (id: string) => {
    setHabits(habits.filter((h) => h.id !== id));
  };

  const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
  const avgStreak = habits.length > 0 ? Math.round(totalStreak / habits.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Habits</h1>
          <p className="text-gray-400 mt-1">Build and maintain positive habits</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
          + New Habit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-gray-400">Active Habits</p>
          <p className="text-3xl font-bold text-white mt-2">{habits.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400">Total Streak Days</p>
          <p className="text-3xl font-bold text-orange-400 mt-2">{totalStreak}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400">Average Streak</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{avgStreak}</p>
        </Card>
      </div>

      {/* Habits Grid */}
      <HabitGrid habits={habits} onComplete={handleComplete} onDelete={handleDelete} />

      {/* Create Habit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Habit" size="md">
        <form className="space-y-4">
          <Input label="Habit Name" placeholder="e.g., Morning Meditation" required />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="health">Health</option>
              <option value="productivity">Productivity</option>
              <option value="learning">Learning</option>
              <option value="wellness">Wellness</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" className="flex-1">
              Create Habit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
