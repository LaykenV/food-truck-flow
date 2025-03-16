'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DisplayMode } from '.';

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
    secondaryColor = '#4CB944',
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

  return (
    <div className={`relative h-screen flex items-center ${displayMode === 'preview' ? '-mt-20 pt-20' : ''}`}>
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
        {/* Removed gradient overlay */}
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-4 relative z-10 py-20 pt-28">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-md">
            {heroTitle}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow">
            {heroSubtitle}
          </p>
          <div className="flex justify-center gap-4">
            {displayMode === 'live' ? (
              <>
                <Button
                  asChild
                  size="lg"
                  className="font-medium px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                  style={{ 
                    backgroundColor: primaryColor,
                    color: 'white'
                  }}
                >
                  <Link href={`/${subdomain}/menu`}>
                    View Our Menu
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="font-medium px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all border-2"
                  style={{ 
                    borderColor: 'white',
                    color: 'white'
                  }}
                >
                  <Link href="#schedule-section">
                    Find Us
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  className="font-medium px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                  style={{ 
                    backgroundColor: primaryColor,
                    color: 'white'
                  }}
                  onClick={handleButtonClick}
                >
                  View Our Menu
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-medium px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all border-2"
                  style={{ 
                    borderColor: 'white',
                    color: 'white'
                  }}
                  onClick={handleButtonClick}
                >
                  Find Us
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 