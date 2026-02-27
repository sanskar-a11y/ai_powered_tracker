'use client';

import { useState, useCallback } from 'react';

type DailyStats = {
  date: string;
  tasksCompleted: number;
  habitsCompleted: number;
  focusMinutes: number;
  productivityScore: number;
};

type AnalyticsData = {
  dailyStats: DailyStats[];
  aggregates: {
    totalTasksCompleted: number;
    totalHabitsCompleted: number;
    totalFocusMinutes: number;
    avgProductivityScore: number;
    daysTracked: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
};

/**
 * Custom hook to fetch analytics data
 */
export function useAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyAnalytics = useCallback(
    async (from?: string, to?: string, days?: number) => {
      try {
        setIsLoading(true);
        setError(null);

        let url = '/api/analytics/daily';
        const params = new URLSearchParams();

        if (from && to) {
          params.append('from', from);
          params.append('to', to);
        } else if (days) {
          params.append('days', days.toString());
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (!data.success) throw new Error(data.error);
        setAnalyticsData(data.data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch analytics';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchWeeklyAnalytics = useCallback(async (week?: number) => {
    try {
      setIsLoading(true);
      setError(null);

      let url = '/api/analytics/weekly';
      if (week !== undefined) {
        url += `?week=${week}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!data.success) throw new Error(data.error);
      setAnalyticsData(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch weekly analytics';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { analyticsData, isLoading, error, fetchDailyAnalytics, fetchWeeklyAnalytics };
}
