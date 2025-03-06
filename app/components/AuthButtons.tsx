'use client';

import { Button } from '@/components/ui/button';
import { AuthModalsWithConfig } from '@/components/auth-modals-with-config';

export function AuthButtons() {
  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
      <AuthModalsWithConfig 
        initialView="sign-up" 
        trigger={
          <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-white">
            Get Started
          </Button>
        }
      />
      
      <AuthModalsWithConfig 
        initialView="sign-in" 
        trigger={
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
            Sign In
          </Button>
        }
      />
    </div>
  );
} 