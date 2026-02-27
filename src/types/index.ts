// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// Task Types
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  userId: string;
  title: string;
  deadline?: Date;
  priority: TaskPriority;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  title: string;
  deadline?: string;
  priority: TaskPriority;
}

export interface UpdateTaskInput {
  title?: string;
  deadline?: string;
  priority?: TaskPriority;
  completed?: boolean;
}

// Habit Types
export interface Habit {
  id: string;
  userId: string;
  name: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: Date;
  createdAt: Date;
}

export interface CreateHabitInput {
  name: string;
}

// Focus Session Types
export interface FocusSession {
  id: string;
  userId: string;
  duration: number; // in minutes
  date: Date;
  createdAt: Date;
}

export interface CreateFocusSessionInput {
  duration: number;
  date?: string;
}

// AI Response Types
export interface AIWeeklySummary {
  summary: string;
  tasksCompleted: number;
  focusMinutes: number;
  topStreak: string;
  recommendation: string;
}

export interface AIGoalPlan {
  goal: string;
  steps: string[];
  timeline: string;
  focus: string;
}

export interface AIHabitOptimization {
  habit: string;
  currentStreak: number;
  suggestion: string;
  motivation: string;
  nextStep: string;
}

// UI Component Props Types
export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: number;
}

export interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onToggle?: (taskId: string, completed: boolean) => void;
}

export interface HabitCardProps {
  habit: Habit;
  onComplete?: () => void;
  onDelete?: () => void;
}

export interface PriorityBadgeProps {
  priority: TaskPriority;
}

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: string;
}
