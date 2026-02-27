import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'AI Productivity OS',
  description: 'Personal AI-powered productivity system'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
