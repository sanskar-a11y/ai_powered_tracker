'use client';

import React from 'react';
import { cn } from '@/utils/formatting';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  interactive?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hover, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-gray-900 rounded-2xl border border-gray-800 p-6 transition-all duration-200',
        hover && 'hover:border-gray-700 hover:shadow-lg hover:shadow-gray-900',
        interactive && 'cursor-pointer hover:bg-gray-850',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = 'Card';
export default Card;
