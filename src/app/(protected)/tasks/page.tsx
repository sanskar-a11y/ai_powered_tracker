'use client';

import { useState } from 'react';
import Card from '@/components/global/Card';
import Button from '@/components/global/Button';
import Input from '@/components/global/Input';
import TaskList from '@/components/tasks/TaskList';
import Modal from '@/components/global/Modal';
import type { Task, CreateTaskInput } from '@/types';

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
  {
    id: '4',
    userId: 'user1',
    title: 'Schedule team meeting',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [search, setSearch] = useState('');

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      filter === 'all' || (filter === 'active' && !task.completed) || (filter === 'completed' && task.completed);
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleToggle = (id: string, completed: boolean) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed } : t)));
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Tasks</h1>
          <p className="text-gray-400 mt-1">Manage your tasks and priorities</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
          + New Task
        </Button>
      </div>

      {/* Controls */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon="🔍"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tasks</option>
            <option value="active">Active Only</option>
            <option value="completed">Completed Only</option>
          </select>
        </div>
      </Card>

      {/* Task Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-gray-400">Total</p>
          <p className="text-2xl font-bold text-white mt-1">{tasks.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400">Active</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{tasks.filter((t) => !t.completed).length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400">Completed</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{tasks.filter((t) => t.completed).length}</p>
        </Card>
      </div>

      {/* Task List */}
      <TaskList
        tasks={filteredTasks}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onEdit={(task) => {
          // TODO: Open edit modal
          setShowModal(true);
        }}
      />

      {/* Create Task Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Task" size="md">
        <form className="space-y-4">
          <Input label="Task Title" placeholder="What needs to be done?" required />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
            <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="low">Low</option>
              <option value="medium" selected>
                Medium
              </option>
              <option value="high">High</option>
            </select>
          </div>

          <Input label="Deadline" type="date" />

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" className="flex-1">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
