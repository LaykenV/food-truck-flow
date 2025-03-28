'use client';

import { useEffect } from 'react';

interface AdminLocalStorageCleanupProps {
  children: React.ReactNode;
}

/**
 * Component that cleans up localStorage items related to the food truck configuration
 * after successful authentication and redirection to the admin dashboard.
 */
export function AdminLocalStorageCleanup({ children }: AdminLocalStorageCleanupProps) {
  useEffect(() => {
    // Clear the staged config after successful login/signup and redirection
    if (typeof window !== 'undefined') {
      localStorage.removeItem('foodTruckConfig');
      console.log('Cleaned up temporary food truck configuration from localStorage');
    }
  }, []); // Empty dependency array ensures it runs only once on mount

  // Just render children - this is a "transparent" wrapper
  return <>{children}</>;
} 