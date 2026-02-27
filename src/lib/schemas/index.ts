import { z } from 'zod';

// Task Schemas
export const TaskPrioritySchema = z.enum(['low', 'medium', 'high']);

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  deadline: z.string().optional(),
  priority: TaskPrioritySchema.default('medium'),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  deadline: z.string().optional(),
  priority: TaskPrioritySchema.optional(),
  completed: z.boolean().optional(),
});

// Habit Schemas
export const CreateHabitSchema = z.object({
  name: z.string().min(1, 'Name required').max(100),
});

export const CompleteHabitSchema = z.object({
  habitId: z.string(),
});

// Focus Session Schema
export const CreateFocusSessionSchema = z.object({
  duration: z.number().min(1).max(480),
  date: z.string().optional(),
});

// AI Schemas
export const AIWeeklySummarySchema = z.object({
  summary: z.string(),
  tasksCompleted: z.number(),
  focusMinutes: z.number(),
  topStreak: z.string(),
  recommendation: z.string(),
});

export const AIGoalPlanSchema = z.object({
  goal: z.string(),
  steps: z.array(z.string()).min(2).max(8),
  timeline: z.string(),
  focus: z.string(),
});

export const AIHabitOptimizationSchema = z.object({
  habit: z.string(),
  currentStreak: z.number(),
  suggestion: z.string(),
  motivation: z.string(),
  nextStep: z.string(),
});

// API Response Schema
export const APIResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
});

// Type exports
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type CreateHabitInput = z.infer<typeof CreateHabitSchema>;
export type CreateFocusSessionInput = z.infer<typeof CreateFocusSessionSchema>;
export type AIWeeklySummary = z.infer<typeof AIWeeklySummarySchema>;
export type AIGoalPlan = z.infer<typeof AIGoalPlanSchema>;
export type AIHabitOptimization = z.infer<typeof AIHabitOptimizationSchema>;
