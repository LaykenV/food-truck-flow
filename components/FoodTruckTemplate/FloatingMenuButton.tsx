'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
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
      // Find the hero section to determine when it's out of view
      const heroButton = document.getElementById('hero-menu-button');
      
      if (heroButton) {
        const rect = heroButton.getBoundingClientRect();
        // Show the floating button when the hero button is out of the viewport (scrolled up)
        const shouldBeVisible = rect.bottom < 0;
        
        if (shouldBeVisible !== visible) {
          setVisible(shouldBeVisible);
          // Start animation sequence
          if (shouldBeVisible) {
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
    
    // Only set up window scroll event listener since we removed preview mode
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
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
        hasOrderTracker ? "bottom-4 sm:bottom-4 md:bottom-4" : "bottom-4 sm:bottom-6 md:bottom-8",
        // Animation states
        animationState === 'hidden' && "opacity-0 translate-y-16 scale-75 pointer-events-none",
        animationState === 'entering' && "opacity-100 translate-y-0 scale-110",
        animationState === 'visible' && "opacity-100 translate-y-0 scale-100",
      )}
      style={{
        visibility: !visible ? 'hidden' : 'visible'
      }}
    >
      <Link href={`/${subdomain}/menu`}>
        <Button
          size="lg"
          className="rounded-full h-14 shadow-lg flex items-center justify-center gap-2 px-6 hover:scale-105 transition-transform"
          style={{ 
            backgroundColor: primaryColor,
            color: 'white',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)'
          }}
        >
          <Menu size={18} />
          <span>Start Order</span>
        </Button>
      </Link>
    </div>
  );
} 