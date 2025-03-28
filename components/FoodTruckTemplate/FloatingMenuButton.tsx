'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu, ArrowRight } from 'lucide-react';
import { DisplayMode } from './index';

interface FloatingMenuButtonProps {
  subdomain: string;
  displayMode: DisplayMode;
  primaryColor?: string;
  secondaryColor?: string;
  hasOrderTracker?: boolean;
}

export default function FloatingMenuButton({
  subdomain,
  displayMode,
  primaryColor = '#FF6B35',
  secondaryColor = '#2EC4B6',
  hasOrderTracker = false
}: FloatingMenuButtonProps) {
  // Early return for preview mode - don't render the component at all
  if (displayMode === 'preview') {
    return null;
  }

  const [visible, setVisible] = useState(false);
  const [animationState, setAnimationState] = useState<'hidden' | 'entering' | 'visible'>('hidden');
  const buttonRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      // Get all hero buttons (both mobile and desktop versions)
      const heroButtons = document.querySelectorAll('#hero-menu-button');
      
      if (heroButtons.length > 0) {
        // Check if ANY of the hero buttons are out of view
        let anyButtonOutOfView = false;
        
        heroButtons.forEach(button => {
          const rect = button.getBoundingClientRect();
          // Check if this button is out of viewport
          if (rect.bottom < 0) {
            anyButtonOutOfView = true;
          }
        });
        
        // Only update state if visibility needs to change
        if (anyButtonOutOfView !== visible) {
          setVisible(anyButtonOutOfView);
          // Start animation sequence
          if (anyButtonOutOfView) {
            setAnimationState('entering');
            // After entering animation completes, set to visible state
            setTimeout(() => {
              setAnimationState('visible');
            }, 500); // Match the duration of the CSS transition
          } else {
            setAnimationState('hidden');
          }
        }
      }
    };
    
    // Set up scroll event listener for all devices
    window.addEventListener('scroll', handleScroll);
    
    // Initial check with a slight delay to ensure DOM is fully loaded
    setTimeout(handleScroll, 200);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [visible]);
  
  if (!visible) {
    return null;
  }

  return (
    <div 
      ref={buttonRef}
      className={cn(
        "fixed right-4 z-30 transition-all duration-500 ease-out floating-menu-button",
        hasOrderTracker ? "bottom-4" : "bottom-4 sm:bottom-6 md:bottom-8",
        // Animation states
        animationState === 'hidden' && "opacity-0 translate-y-16 scale-75 pointer-events-none",
        animationState === 'entering' && "opacity-100 translate-y-0 scale-110",
        animationState === 'visible' && "opacity-100 translate-y-0 scale-100",
      )}
    >
      <Link href={`/${subdomain}/menu`}>
        <Button
          size="lg"
          className="group rounded-full h-14 shadow-lg flex items-center justify-center gap-2 px-6 hover:scale-105 transition-transform"
          style={{ 
            backgroundColor: primaryColor,
            color: 'white',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)'
          }}
        >
          <span>Start Order</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
  );
} 