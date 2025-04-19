'use client';

import { Button } from '@/components/ui/button';
import { AuthModals } from '@/components/auth-modals';

export function AuthButtons() {
  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
      <AuthModals 
        initialView="sign-up" 
        trigger={
          <Button size="lg" className="bg-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary)/0.9)] text-[hsl(var(--admin-primary-foreground))]">
            Get Started
          </Button>
        }
      />
      
      <AuthModals 
        initialView="sign-in" 
        trigger={
          <Button size="lg" variant="outline" className="border-[hsl(var(--admin-primary))] text-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary)/0.1)]">
            Sign In
          </Button>
        }
      />
    </div>
  );
} 