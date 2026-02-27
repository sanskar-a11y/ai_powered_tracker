import './globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'AI Productivity OS',
  description: 'Personal AI-powered productivity system built with Next.js and Gemini AI',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#2563eb',
          colorBackground: '#0f172a',
          colorInputBackground: '#1e293b',
          colorInputText: '#f1f5f9',
        },
      }}
    >
      <html lang="en">
        <body className="bg-gray-950 text-gray-100 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
