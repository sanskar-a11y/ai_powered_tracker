'use client';

import Link from 'next/link';
import Button from '@/components/global/Button';

export default function Home() {
  return (
    <div className="w-full max-w-xl">
      {/* Hero Section */}
      <div className="text-center space-y-6 mb-12">
        <div className="inline-block">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Productivity OS
          </h1>
        </div>

        <p className="text-xl text-gray-400 leading-relaxed">
          An AI-powered productivity system that learns your habits, optimizes your focus, and helps you achieve your goals.
        </p>

        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-3 text-gray-300">
            <span className="text-2xl">⚡</span>
            <span>AI-Powered Goal Planning</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <span className="text-2xl">🎯</span>
            <span>Smart Habit Tracking</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <span className="text-2xl">📊</span>
            <span>Real-Time Analytics</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <span className="text-2xl">🤖</span>
            <span>Personalized AI Insights</span>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/sign-up" className="flex-1">
          <Button variant="primary" size="lg" className="w-full">
            Get Started Free
          </Button>
        </Link>
        <Link href="/sign-in" className="flex-1">
          <Button variant="secondary" size="lg" className="w-full">
            Sign In
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <p className="text-center text-gray-500 text-sm mt-12">
        No credit card required • Free 30-day trial
      </p>
    </div>
  );
}
