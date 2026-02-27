'use client';

import React from 'react';
import type { EmptyStateProps } from '@/types';
import Button from './Button';

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action, icon = '📭' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-200 mb-2">{title}</h3>
      {description && <p className="text-gray-400 text-center max-w-xs mb-6">{description}</p>}
      {action && (
        <Button variant="primary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
