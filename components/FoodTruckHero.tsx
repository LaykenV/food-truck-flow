'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
  };
  subdomain: string;
}

export default function FoodTruckHero({ config, subdomain }: FoodTruckHeroProps) {
  // Extract configuration data with defaults
  const {
    hero,
    name = 'Food Truck',
    tagline = 'Delicious food on wheels',
    primaryColor = '#FF6B35',
  } = config;

  const heroTitle = hero?.title || name;
  const heroSubtitle = hero?.subtitle || tagline;
  const heroImage = hero?.image || '/images/food-truck-background.jpg';

  return (
    <div className="relative min-h-[70vh] flex items-center">
      {/* Background Image with Overlay */}
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
          className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30"
        ></div>
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-4 relative z-10 py-20 pt-28">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {heroTitle}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            {heroSubtitle}
          </p>
          <div className="flex justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white hover:bg-gray-100 text-gray-900 font-medium px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              style={{ 
                backgroundColor: 'white',
                color: primaryColor
              }}
            >
              <Link href={`/${subdomain}/menu`}>
                View Our Menu
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 