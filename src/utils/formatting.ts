// Date formatting utilities
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateFull = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const isOverdue = (deadline: Date | string): boolean => {
  const d = new Date(deadline);
  return d < new Date();
};

export const daysUntilDeadline = (deadline: Date | string): number => {
  const d = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// String utilities
export const truncate = (text: string, length: number): string => {
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

export const cn = (...classes: (string | undefined | boolean)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Data transformation
export const groupByDate = <T extends { date: Date | string }>(items: T[]): Record<string, T[]> => {
  return items.reduce(
    (acc, item) => {
      const date = formatDate(item.date);
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
};

// Array utilities
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Math utilities
export const calculatePercentage = (current: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

export const getStreakColor = (streak: number): string => {
  if (streak >= 30) return 'from-purple-500 to-pink-500';
  if (streak >= 14) return 'from-blue-500 to-cyan-500';
  if (streak >= 7) return 'from-green-500 to-emerald-500';
  if (streak >= 5) return 'from-yellow-500 to-orange-500';
  return 'from-gray-500 to-gray-600';
};
