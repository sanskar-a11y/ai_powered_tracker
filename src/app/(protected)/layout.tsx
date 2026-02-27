'use client';

import { ReactNode } from 'react'
import AppLayout from '@/components/layout/AppLayout'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  // TODO: In production, verify user is authenticated here
  // For now, assuming authentication happens at middleware level or via environment

  return (
    <AppLayout userName="User">
      {children}
    </AppLayout>
  )
}
