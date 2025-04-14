'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { DisplayMode } from '.';
import { useCallback, useEffect, useState } from 'react';

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

export default function FoodTruckHero({ config, displayMode, subdomain, forceViewMode }: FoodTruckHeroProps) {
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
  
  // Determine if we should show mobile view based on forceViewMode or screen size
  const [isMobileView, setIsMobileView] = useState(forceViewMode === 'mobile');
  
  useEffect(() => {
    if (forceViewMode) {
      setIsMobileView(forceViewMode === 'mobile');
    } else {
      const checkMobileView = () => {
        setIsMobileView(window.innerWidth < 768);
      };
      
      checkMobileView();
      window.addEventListener('resize', checkMobileView);
      
      return () => {
        window.removeEventListener('resize', checkMobileView);
      };
    }
  }, [forceViewMode]);

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
    <>
      {/* Mobile hero section - visible when isMobileView is true */}
      <section className={`${!isMobileView ? 'hidden' : ''} ${displayMode === 'preview' ? '' : ''}`}>
        <div 
          className="relative w-full h-[50vh] overflow-hidden flex flex-col items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor}70, ${secondaryColor}70)` 
          }}
        >
          {/* Food truck image */}
          <div className="relative w-full h-full flex items-center justify-center px-6 z-10">
            <Image
              src={heroImage}
              alt={heroTitle}
              width={500}
              height={500}
              className="object-contain max-h-full"
              sizes="(max-width: 768px) 90vw, 500px"
              priority
            />
          </div>
          
          {/* Start Order button moved inside hero area */}
          <div className="absolute bottom-6 left-4 right-4 z-20 flex justify-center">
            {displayMode === 'live' ? (
              <Button
                asChild
                size="lg"
                className="group w-[90%]"
                id="hero-menu-button"
                style={{ 
                  background: `linear-gradient(to right, ${secondaryColor}90, ${primaryColor}90)`,
                  color: heroFont,
                  border: `2px solid ${heroFont}`,
                  fontWeight: 'bold',
                  fontSize: '1.4rem'
                }}
              >
                <Link href={`/${subdomain}/menu`} prefetch={true}>
                  View Menu
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                className="group w-[90%]"
                id="hero-menu-button"
                style={{ 
                  background: `linear-gradient(to right, ${secondaryColor}, ${primaryColor})`,
                  color: heroFont,
                  fontSize: '1.4rem',
                  fontWeight: 'bold'
                }}
                onClick={handleButtonClick}
              >
                View Menu
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            )}
          </div>
        </div>
      </section>
      
      {/* Desktop hero (full screen) - visible when isMobileView is false */}
      <section 
        className={`${isMobileView ? 'hidden' : ''} relative min-h-[100vh] ${displayMode === 'preview' ? '' : ''}`}
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}70, ${secondaryColor}70)` 
        }}
      >
        {/* Hero Content - Two column layout */}
        <div className="container relative z-10 mx-auto px-4 py-12 h-full">
          <div className="flex flex-row items-center h-full py-8">
            {/* Left column - Text content */}
            <div className="w-full md:w-1/2 pr-4 pt-8">
              <h1 
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
                style={{ color: heroFont }}
              >
                {heroTitle}
              </h1>
              <p 
                className="text-2xl md:text-3xl mb-8"
                style={{ color: heroFont }}
              >
                {heroSubtitle}
              </p>
              <div className="flex flex-row gap-4">
                {displayMode === 'live' ? (
                  <>
                    <Button
                      asChild
                      size="lg"
                      className="group"
                      id="hero-menu-button"
                      style={{ 
                        background: heroFont,
                        opacity: 0.8,
                        color: secondaryColor,
                        border: `2px solid ${secondaryColor}`,
                        fontWeight: 'bold',
                        fontSize: '1.4rem'
                      }}
                    >
                      <Link href={`/${subdomain}/menu`} prefetch={true}>
                        View Menu
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="group border-2 hover:text-white"
                      style={{ 
                        borderColor: heroFont,
                        color: heroFont,
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
                        background: `linear-gradient(to right, ${secondaryColor}90, ${primaryColor}90)`,
                        color: heroFont,
                        border: `2px solid ${heroFont}`,
                        fontWeight: 'bold',
                        fontSize: '1.4rem'
                      }}
                      onClick={handleButtonClick}
                    >
                      View Menu
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="group border-2 hover:text-white"
                      style={{ 
                        borderColor: secondaryColor,
                        color: heroFont,
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
            
            {/* Right column - Food truck image */}
            <div className="hidden md:flex md:w-1/2 justify-center items-center relative">
              <div className="relative w-full h-[80vh] flex items-center justify-center">
                <Image
                  src={heroImage}
                  alt={heroTitle}
                  width={700}
                  height={700}
                  className="object-contain"
                  sizes="(min-width: 768px) 50vw, 100vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-2 z-10"
          style={{ 
            background: `linear-gradient(to right, ${secondaryColor}, ${primaryColor})` 
          }}
        ></div>
      </section>
    </>
  );
}