'use client';

import { useState, useEffect, useRef } from 'react';
import FoodTruckHero from './FoodTruckHero';
import FoodTruckAbout from './FoodTruckAbout';
import FoodTruckContact from './FoodTruckContact';
import FoodTruckSchedule from './FoodTruckSchedule';

// Define the configuration type
export type FoodTruckConfig = {
  hero?: {
    image?: string;
    title?: string;
    subtitle?: string;
  };
  logo?: string;
  name?: string;
  about?: {
    image?: string;
    title?: string;
    content?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  social?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  schedule?: {
    title?: string;
    description?: string;
    days?: {
      day: string;
      location?: string;
      address?: string;
      hours?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    }[];
  };
  tagline?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

// Define the display mode type
export type DisplayMode = 'live' | 'preview';

// Props for the FoodTruckTemplate component
export interface FoodTruckTemplateProps {
  config: FoodTruckConfig;
  displayMode: DisplayMode;
  subdomain?: string;
  forceViewMode?: 'mobile' | 'desktop';
}

export default function FoodTruckTemplate({ 
  config, 
  displayMode, 
  subdomain = 'preview',
  forceViewMode
}: FoodTruckTemplateProps) {
  // Client-side state to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  
  // Use useEffect to set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
    
    // Set mobile view based on forceViewMode or window size
    const handleResize = () => {
      if (forceViewMode === 'mobile') {
        setIsMobileView(true);
      } else if (forceViewMode === 'desktop') {
        setIsMobileView(false);
      } else {
        setIsMobileView(window.innerWidth < 768);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [forceViewMode]);
  
  // If not yet client-side, render a simplified version to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 relative">
        <main className="flex-grow">
          <div className="relative max-w-full mx-auto py-16 px-4 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
              {config.hero?.title || config.name || 'Food Truck'}
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              {config.hero?.subtitle || config.tagline || 'Delicious food on wheels'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${isMobileView ? 'mobile-view' : ''}`}>
      <main className="flex-grow">
        {/* Hero Section */}
        <FoodTruckHero 
          config={config} 
          displayMode={displayMode} 
          subdomain={subdomain}
          forceViewMode={forceViewMode}
        />
        
        {/* About Section */}
        <FoodTruckAbout 
          config={config} 
          displayMode={displayMode}
          forceViewMode={forceViewMode}
        />
        
        {/* Schedule Section */}
        <FoodTruckSchedule
          config={config}
          displayMode={displayMode}
          forceViewMode={forceViewMode}
        />
        
        {/* Contact Section */}
        <FoodTruckContact 
          config={config} 
          displayMode={displayMode}
          forceViewMode={forceViewMode}
        />
      </main>
    </div>
  );
} 