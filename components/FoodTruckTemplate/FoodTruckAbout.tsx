'use client';

import { DisplayMode } from '.';
import Image from 'next/image';

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

export default function FoodTruckAbout({ config, displayMode }: FoodTruckAboutProps) {
  const { about, primaryColor, secondaryColor } = config;
  
  if (!about) return null;

  return (
    <section className="py-12 px-4 md:px-8 max-w-6xl mx-auto" style={{ backgroundColor: secondaryColor + '10' }}>
      <div className="flex flex-col md:flex-row gap-8 items-center">
        {about.image && (
          <div className="w-full md:w-1/2">
            <div className="rounded-lg overflow-hidden shadow-lg" style={{ borderColor: primaryColor, borderWidth: '2px' }}>
              <Image 
                src={about.image} 
                alt={about.title || 'About Us'} 
                width={600} 
                height={400} 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        )}
        
        <div className="w-full md:w-1/2">
          {about.title && (
            <h2 
              className="text-3xl font-bold mb-4" 
              style={{ color: primaryColor }}
            >
              {about.title}
            </h2>
          )}
          
          {about.content && (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: about.content }}
            />
          )}
        </div>
      </div>
    </section>
  );
} 