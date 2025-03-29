'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function MenuError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console or analytics service
    console.error('Menu Page Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white">
      {/* Spacer for navbar */}
      <div className="h-16"></div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="text-center max-w-md">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-4">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Menu Loading Error</h1>
            <p className="text-gray-600 mb-8">
              {error.message || "We encountered an error while loading the menu. Please try refreshing the page."}
            </p>
            <Button 
              onClick={() => reset()}
              className="px-6 rounded-full"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload menu
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 