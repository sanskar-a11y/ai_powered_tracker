'use client';

import { SignIn } from '@clerk/nextjs';

/**
 * Sign-in page using Clerk
 * 
 * Features:
 * - Handles email verification flow automatically
 * - Redirects to /dashboard after successful sign-in
 * - Email verification routes managed by Clerk internally
 * - No need to create separate verification pages
 */
export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            AI Productivity OS
          </h1>
          <p className="text-gray-400">Welcome back</p>
        </div>

        <SignIn
          afterSignInUrl="/dashboard"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-gray-900 border border-gray-800 shadow-2xl',
              headerTitle: 'text-2xl font-bold text-white',
              headerSubtitle: 'text-gray-400',
              socialButtonsBlockButton: 'border-gray-700 hover:bg-gray-800',
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
              footerActionLink: 'text-blue-400 hover:text-blue-300',
              dividerLine: 'bg-gray-700',
              dividerText: 'text-gray-400',
              formFieldInput: 'bg-gray-800 border-gray-700 text-white',
              formFieldLabel: 'text-gray-300',
            },
          }}
        />
      </div>
    </div>
  );
}
