'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  
  // Only render the layout for the forgot-password page
  if (pathname !== '/forgot-password') {
    return children;
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="flex items-center gap-1">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </Button>
      </div>
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        {children}
      </div>
    </div>
  );
}
