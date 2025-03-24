'use client';

import { useState, useEffect, useRef } from 'react';
import FoodTruckHero from './FoodTruckHero';
import FoodTruckAbout from './FoodTruckAbout';
import FoodTruckContact from './FoodTruckContact';
import FoodTruckSchedule from './FoodTruckSchedule';
import FoodTruckNavbar from './FoodTruckNavbar';
import FoodTruckFooter from './FoodTruckFooter';
import FloatingMenuButton from './FloatingMenuButton';

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
  };
  socials?: {
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
  heroFont?: string;
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
  const [hasOrderTracker, setHasOrderTracker] = useState(false);
  
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
    
    // Check if the OrderStatusTracker is present in the DOM
    const checkForOrderTracker = () => {
      const orderTrackerElement = document.querySelector('[class*="OrderStatusTracker"]');
      setHasOrderTracker(!!orderTrackerElement);
    };
    
    // Check initially and then periodically
    checkForOrderTracker();
    const trackerCheckInterval = setInterval(checkForOrderTracker, 2000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(trackerCheckInterval);
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
      {/* Navbar */}
      <FoodTruckNavbar
        config={config}
        subdomain={subdomain}
        displayMode={displayMode}
        forceViewMode={forceViewMode}
      />
      
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
      
      {/* Floating Menu Button */}
      <FloatingMenuButton
        subdomain={subdomain}
        displayMode={displayMode}
        primaryColor={config.primaryColor}
        secondaryColor={config.secondaryColor}
        hasOrderTracker={hasOrderTracker}
      />
      
      {/* Footer */}
      <FoodTruckFooter
        config={config}
        subdomain={subdomain}
        displayMode={displayMode}
        forceViewMode={forceViewMode}
      />
    </div>
  );
} 