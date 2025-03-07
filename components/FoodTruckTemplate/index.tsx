'use client';

import { useState, useEffect, useRef } from 'react';
import FoodTruckHero from './FoodTruckHero';
import FoodTruckAbout from './FoodTruckAbout';
import FoodTruckContact from './FoodTruckContact';

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
}

export default function FoodTruckTemplate({ 
  config, 
  displayMode, 
  subdomain = 'preview' 
}: FoodTruckTemplateProps) {
  // Client-side state to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false);
  
  // Use useEffect to set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);
  
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
    <div className="flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <FoodTruckHero 
          config={config} 
          displayMode={displayMode} 
          subdomain={subdomain} 
        />
        
        {/* About Section */}
        <FoodTruckAbout 
          config={config} 
          displayMode={displayMode} 
        />
        
        {/* Contact Section */}
        <FoodTruckContact 
          config={config} 
          displayMode={displayMode} 
        />
      </main>
    </div>
  );
} 