'use client';

import { useState, useCallback } from 'react';

type AIReport = {
  id: string;
  weekStart: string;
  weekEnd: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  productivityScore: number;
  totalFocusHours: number;
  habitsCompleted: number;
  tasksCompleted: number;
  createdAt: string;
};

/**
 * Custom hook to manage AI reports
 */
export function useAIReport() {
  const [report, setReport] = useState<AIReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch the latest AI report
   */
  const fetchLatestReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch('/api/ai/weekly-report');
      const data = await res.json();

      if (!data.success) throw new Error(data.error);
      setReport(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch report';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Generate a new AI report
   */
  const generateReport = useCallback(
    async (weekStart?: string, weekEnd?: string) => {
      try {
        setIsGenerating(true);
        setError(null);

        const res = await fetch('/api/ai/weekly-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weekStart,
            weekEnd,
          }),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        setReport(data.data);
        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to generate report';
        setError(message);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return { report, isLoading, isGenerating, error, fetchLatestReport, generateReport };
}
