'use client';

import React, { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Button from '@/components/global/Button';

interface HeaderProps {
  onMenuToggle?: () => void;
  sidebarOpen?: boolean;
}

/**
 * Header Component
 * 
 * Displays user information from Clerk and handles sign-out.
 * Uses useUser() hook to get authenticated user data from Clerk.
 */
const Header: React.FC<HeaderProps> = ({ onMenuToggle, sidebarOpen = false }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  // Extract user display name
  const displayName = user?.firstName || user?.fullName || (user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User');

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // TODO: Implement theme toggle
  };

  const handleLogout = async () => {
    await signOut(() => router.push('/'));
  };

  return (
    <header className="sticky top-0 z-20 bg-gray-950 border-b border-gray-800">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Logo and mobile toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white hidden sm:block">Productivity OS</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-200"
            aria-label="Toggle theme"
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v1m0 16v1m9-9h-1m-16 0H1m15.364 1.636l.707.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* User menu */}
          {isLoaded && (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{displayName}</p>
                <p className="text-xs text-gray-500">Premium</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Sign out button */}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
