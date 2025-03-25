'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { DisplayMode } from '.';
import { useCallback } from 'react';

export interface FoodTruckHeroProps {
  config: {
    hero?: {
      image?: string;
      title?: string;
      subtitle?: string;
    };
    name?: string;
    tagline?: string;
    primaryColor?: string;
    secondaryColor?: string;
    heroFont?: string;
  };
  displayMode: DisplayMode;
  subdomain: string;
  forceViewMode?: 'mobile' | 'desktop';
}

export default function FoodTruckHero({ config, displayMode, subdomain }: FoodTruckHeroProps) {
  // Extract configuration data with defaults
  const {
    hero,
    name = 'Food Truck',
    tagline = 'Delicious food on wheels',
    primaryColor = '#FF6B35',
    secondaryColor = '#2EC4B6',
    heroFont = '#FFFFFF', // Default to white if not specified
  } = config;

  const heroTitle = hero?.title || name;
  const heroSubtitle = hero?.subtitle || tagline;
  const heroImage = hero?.image || '/images/food-truck-background.jpg';

  // Handle button click based on display mode
  const handleButtonClick = (e: React.MouseEvent) => {
    if (displayMode === 'preview') {
      e.preventDefault();
      // Maybe show a toast: "This button is disabled in preview mode"
    }
    // Live mode will follow the link naturally
  };

  // Handle smooth scroll to schedule section
  const handleSmoothScroll = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    const scheduleSection = document.getElementById('schedule-section');
    if (scheduleSection) {
      scheduleSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, []);

  return (
    <section className={`relative min-h-[100vh] flex items-center ${displayMode === 'preview' ? '-mt-20 pt-20' : ''}`}>
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt={heroTitle}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div 
          className="absolute inset-0" 
          style={{ 
            background: `linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.4))` 
          }}
        />
      </div>

      {/* Hero Content */}
      <div className="container relative z-10 mx-auto px-4 py-20 mt-16">
        <div className="max-w-3xl">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            style={{ color: heroFont }}
          >
            {heroTitle}
          </h1>
          <div 
            className="w-24 h-2 mb-6"
            style={{ 
              background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` 
            }}
          ></div>
          <p 
            className="text-xl md:text-2xl mb-8"
            style={{ color: heroFont }}
          >
            {heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {displayMode === 'live' ? (
              <>
                <Button
                  asChild
                  size="lg"
                  className="group"
                  id="hero-menu-button"
                  style={{ 
                    backgroundColor: primaryColor,
                    color: 'white'
                  }}
                >
                  <Link href={`/${subdomain}/menu`} prefetch={true}>
                    Start Order
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="group border-2 hover:text-white"
                  style={{ 
                    borderColor: secondaryColor,
                    color: secondaryColor,
                    backgroundColor: 'transparent',
                    "&:hover": {
                      backgroundColor: secondaryColor
                    }
                  } as React.CSSProperties}
                  onClick={handleSmoothScroll}
                >
                  Find Us
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  className="group"
                  id="hero-menu-button"
                  style={{ 
                    backgroundColor: primaryColor,
                    color: 'white'
                  }}
                  onClick={handleButtonClick}
                >
                  Start Order
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="group border-2 hover:text-white"
                  style={{ 
                    borderColor: secondaryColor,
                    color: secondaryColor,
                    backgroundColor: 'transparent',
                    "&:hover": {
                      backgroundColor: secondaryColor
                    }
                  } as React.CSSProperties}
                  onClick={handleSmoothScroll}
                >
                  Find Us
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-2 z-10"
        style={{ 
          background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` 
        }}
      ></div>
    </section>
  );
} 