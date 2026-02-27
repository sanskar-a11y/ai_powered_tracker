import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AIWeeklySummarySchema,
  AIGoalPlanSchema,
  AIHabitOptimizationSchema,
} from '@/lib/schemas';
import type { AIWeeklySummary, AIGoalPlan, AIHabitOptimization } from '@/types';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

interface GeminiCall {
  prompt: string;
  schema: any;
  model?: string;
}

const callGemini = async ({ prompt, schema, model = 'gemini-1.5-flash' }: GeminiCall) => {
  try {
    const gemini = genAI.getGenerativeModel({ model });

    const fullPrompt = `${prompt}

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON object
- Do NOT include markdown formatting
- Do NOT include code blocks
- Do NOT include explanation or commentary
- Do NOT include extra text before or after JSON
- Ensure JSON is valid and parseable`;

    const response = await gemini.generateContent(fullPrompt);
    const text = response.response.text();

    // Remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    // Parse JSON
    const parsed = JSON.parse(cleanedText);

    // Validate against schema
    const validated = schema.parse(parsed);
    return validated;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Weekly Summary Generation
export const generateWeeklySummary = async (
  tasksCompleted: number,
  focusMinutes: number,
  topHabit: string | null,
  topStreakDays: number
): Promise<AIWeeklySummary> => {
  const prompt = `Generate a weekly productivity summary based on this data:
- Tasks completed: ${tasksCompleted}
- Focus time: ${focusMinutes} minutes
- Top habit streak: ${topHabit || 'None'} (${topStreakDays} days)

Return JSON with schema:
{
  "summary": "2-3 sentence overview of the week",
  "tasksCompleted": ${tasksCompleted},
  "focusMinutes": ${focusMinutes},
  "topStreak": "habit name or 'No habits tracked'",
  "recommendation": "One specific actionable recommendation for next week"
}`;

  return callGemini({
    prompt,
    schema: AIWeeklySummarySchema,
  });
};

// Goal Planning
export const generateGoalPlan = async (goal: string, context?: string): Promise<AIGoalPlan> => {
  const prompt = `Create an actionable plan for this goal: "${goal}"
${context ? `Context: ${context}` : ''}

Return JSON with schema:
{
  "goal": "${goal}",
  "steps": ["step 1", "step 2", "step 3", "step 4"],
  "timeline": "Realistic timeline estimate",
  "focus": "Primary focus area or metric to track"
}

Provide 4-6 specific, actionable steps.`;

  return callGemini({
    prompt,
    schema: AIGoalPlanSchema,
  });
};

// Habit Optimization
export const optimizeHabit = async (
  habitName: string,
  currentStreak: number,
  context?: string
): Promise<AIHabitOptimization> => {
  const prompt = `Optimize this habit: "${habitName}" with ${currentStreak} day streak.
${context ? `Context: ${context}` : ''}

Return JSON with schema:
{
  "habit": "${habitName}",
  "currentStreak": ${currentStreak},
  "suggestion": "Specific suggestion to improve the habit",
  "motivation": "Motivational insight for streak ${currentStreak > 7 ? 'continuation' : 'building'}",
  "nextStep": "Next concrete action to take today"
}`;

  return callGemini({
    prompt,
    schema: AIHabitOptimizationSchema,
  });
};

// Validate JSON response
export const validateAIResponse = (data: unknown, schema: any): boolean => {
  try {
    schema.parse(data);
    return true;
  } catch {
    return false;
  }
};
