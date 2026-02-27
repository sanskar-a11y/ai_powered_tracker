'use client';

import React from 'react';
import { cn } from '@/utils/formatting';
import type { TaskPriority } from '@/types';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'priority';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  priority?: TaskPriority;
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, priority, children, ...props }, ref) => {
    let styles = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold';

    const variants = {
      default: 'bg-gray-800 text-gray-300',
      success: 'bg-green-900 text-green-300',
      warning: 'bg-yellow-900 text-yellow-300',
      danger: 'bg-red-900 text-red-300',
      info: 'bg-blue-900 text-blue-300',
      priority: priority === 'high' ? 'bg-red-900 text-red-300' : priority === 'medium' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300',
    };

    return (
      <span ref={ref} className={cn(styles, variants[variant || 'default'], className)} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
export default Badge;
