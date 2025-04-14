'use client';

import { DisplayMode } from '.';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface FoodTruckAboutProps {
  config: {
    about?: {
      title?: string;
      content?: string;
      image?: string;
    };
    contact?: {
      phone?: string;
      email?: string;
    };
    primaryColor?: string;
    secondaryColor?: string;
  };
  displayMode: DisplayMode;
  forceViewMode?: 'mobile' | 'desktop';
}

export default function FoodTruckAbout({ config, displayMode, forceViewMode }: FoodTruckAboutProps) {
  const { about, primaryColor, secondaryColor = '#4CB944' } = config;
  
  // State to track if mobile view should be used
  const [isMobileView, setIsMobileView] = useState(forceViewMode === 'mobile');
  
  // Update isMobileView when forceViewMode changes or on screen resize
  useEffect(() => {
    if (forceViewMode) {
      setIsMobileView(forceViewMode === 'mobile');
    } else {
      const checkMobileView = () => {
        setIsMobileView(window.innerWidth < 1024); // Using lg breakpoint
      };
      
      checkMobileView();
      window.addEventListener('resize', checkMobileView);
      
      return () => {
        window.removeEventListener('resize', checkMobileView);
      };
    }
  }, [forceViewMode]);
  
  if (!about) return null;

  return (
    <section className="py-12 sm:py-20">
      <div className="container mx-auto px-4">
        {about.title && (
          <div className="text-center mb-8 sm:mb-12">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4" 
              style={{ color: '#000000', opacity: 0.8 }}
            >
              {about.title}
            </h2>
            <div 
              className="w-16 h-1 mx-auto mb-6"
              style={{ backgroundColor: primaryColor }}
            ></div>
          </div>
        )}
        
        <Card className="bg-background shadow-lg overflow-hidden" style={{ 
          borderWidth: "1px",
          borderImage: `linear-gradient(to right, ${primaryColor || '#FF6B35'}, ${secondaryColor}) 1`,
        }}>
          <div className={cn(
            "flex flex-col",
            !isMobileView && "lg:flex-row"
          )}>
            {about.image && (
              <div className={cn(
                "w-full",
                !isMobileView && "lg:w-1/2"
              )}>
                <div className="relative aspect-video h-full">
                  <Image 
                    src={about.image} 
                    alt={about.title || 'About Us'} 
                    fill
                    className="object-cover"
                    sizes={isMobileView ? "100vw" : "(max-width: 1024px) 100vw, 50vw"}
                  />
                </div>
              </div>
            )}
            
            <div className={cn(
              "w-full p-6 md:p-8 flex items-center",
              !isMobileView && "lg:w-1/2"
            )}>
              {about.content && (
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: about.content }}
                />
              )}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
} 