'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OrderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Extract the subdomain from the URL
  const subdomain = typeof window !== 'undefined' 
    ? window.location.pathname.split('/')[1]
    : '';

  useEffect(() => {
    // Log the error to console or analytics service
    console.error('Order Page Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white">
      {/* Spacer for navbar */}
      <div className="h-16"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          {subdomain && (
            <Link 
              href={`/menu`} 
              className="inline-flex items-center text-primary hover:underline transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Menu
            </Link>
          )}
        </div>
        
        <div className="flex justify-center py-12">
          <div className="text-center max-w-md">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-4">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Order System Error</h1>
            <p className="text-gray-600 mb-8">
              {error.message || "We encountered an error while processing your order. Please try again or contact support if the issue persists."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => reset()}
                className="px-6 rounded-full"
                size="lg"
              >
                Try again
              </Button>
              {subdomain && (
                <Button 
                  variant="outline"
                  className="px-6 rounded-full"
                  size="lg"
                  asChild
                >
                  <Link href={`/menu`}>
                    Return to menu
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 