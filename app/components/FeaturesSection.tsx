'use client';

import React, { useState, useRef, UIEvent } from 'react';
import { cn } from '@/lib/utils';

// Placeholder data for features - replace image URLs with actual paths
const features = [
  {
    title: "Launch Your Website",
    description: "Create your online presence in minutes with our easy-to-use website template builder.",
    imageUrl: "/images/placeholder-hero.jpg", // Replace with actual image path
    icon: (
      <svg className="w-6 h-6 text-[hsl(var(--admin-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    )
  },
  {
    title: "Streamline Online Orders",
    description: "Manage customer orders seamlessly and send real-time notifications when food is ready.",
    imageUrl: "/placeholder-orders.png", // Replace with actual image path
    icon: (
       <svg className="w-6 h-6 text-[hsl(var(--admin-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
    )
  },
  {
    title: "Set Schedule & Location",
    description: "Keep customers updated on your weekly schedule, operating hours, and exact locations.",
    imageUrl: "/placeholder-schedule.png", // Replace with actual image path
    icon: (
      <svg className="w-6 h-6 text-[hsl(var(--admin-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    )
  },
  {
    title: "Dynamic Menu Management",
    description: "Easily update your menu, add new items, and toggle availability based on inventory.",
    imageUrl: "/placeholder-menu.png", // Replace with actual image path
     icon: (
       <svg className="w-6 h-6 text-[hsl(var(--admin-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
     )
  },
  {
    title: "Generate 3D Food Truck Model",
    description: "Create a unique 3D model of your truck to showcase on your website.",
    imageUrl: "/images/exampleTruck.png", // Replace with actual image path
     icon: (
      <svg className="w-6 h-6 text-[hsl(var(--admin-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
    )
  },
  {
    title: "Publish & Go Live",
    description: "Choose your custom subdomain (e.g., mytruck.foodtruckflow.com) and publish instantly.",
    imageUrl: "/placeholder-publish.png", // Replace with actual image path
    icon: (
      <svg className="w-6 h-6 text-[hsl(var(--admin-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    )
  },
];

export function FeaturesSection() {
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle scroll events for carousel
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const totalWidth = container.scrollWidth - container.clientWidth; // Total scrollable width
    
    if (totalWidth <= 0) return; // Avoid division by zero if not scrollable

    // Estimate card width - might need adjustment based on actual layout/margins
    const cardWidthEstimate = container.scrollWidth / features.length; 
    
    // Calculate the index based on the center of the viewport
    const centerScrollPosition = scrollLeft + container.clientWidth / 2;
    let newIndex = Math.floor(centerScrollPosition / cardWidthEstimate);

    // Clamp index to valid range
    newIndex = Math.max(0, Math.min(features.length - 1, newIndex));

    if (newIndex !== selectedFeatureIndex) {
      setSelectedFeatureIndex(newIndex);
    }
  };

  return (
    <section id="features" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full lg:w-[90%] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[hsl(var(--admin-foreground))] sm:text-4xl">All-in-One Solution</h2>
          <p className="mt-4 text-lg text-[hsl(var(--admin-foreground)/0.8)] max-w-3xl mx-auto">
            Everything you need to establish your online presence, streamline operations, and grow your business.
          </p>
        </div>

        {/* New Image Preview Section */}
        <div className="lg:flex lg:items-center lg:gap-12">
          {/* Image Display (Left on Desktop, Top on Mobile) */}
          <div className="lg:w-1/2 mb-8 lg:mb-0">
             {/* Using padding-top for 16:9 ratio */}
            <div className="relative w-full overflow-hidden rounded-xl shadow-lg  bg-transparent" style={{ paddingTop: '56.25%' }}> {/* 9 / 16 = 0.5625 */}
              <img
                src={features[selectedFeatureIndex].imageUrl}
                alt={`${features[selectedFeatureIndex].title} preview`}
                className="absolute top-0 left-0 w-full h-full object-cover"
                // Add loading state or placeholder if needed
              />
            </div>
          </div>

          {/* Feature Interaction Area (Right Grid on Desktop, Scrollable Cards on Mobile) */}
          <div className="lg:w-1/2 relative">
            {/* Mobile: Scrollable horizontal card container */}
            <div 
              ref={scrollContainerRef}
              className="lg:hidden flex overflow-x-auto space-x-3 pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
              onScroll={handleScroll}
            >
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "min-w-[280px] w-[85vw] max-w-[340px] p-1 snap-center flex-shrink-0"
                  )}
                >
                  <button 
                    onClick={() => setSelectedFeatureIndex(index)}
                    className={cn(
                      `w-full h-full p-4 rounded-lg text-left transition-all border`, 
                      selectedFeatureIndex === index 
                        ? 'bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-primary-foreground))] shadow-md border-transparent scale-105'
                        : 'bg-[hsl(var(--admin-card))] hover:bg-[hsl(var(--admin-muted))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-foreground))] opacity-80'
                    )}
                  >
                    <div className="flex items-center mb-2">
                      <div className={cn(
                        `w-8 h-8 rounded-md flex items-center justify-center mr-3 flex-shrink-0`, 
                        selectedFeatureIndex === index ? 'bg-white/20' : 'bg-[hsl(var(--admin-primary)/0.2)]'
                      )}>
                         {React.cloneElement(feature.icon, { className: cn(`w-5 h-5`, selectedFeatureIndex === index ? 'text-white' : 'text-[hsl(var(--admin-primary))] ') })}
                      </div>
                      <h4 className="font-semibold text-base">{feature.title}</h4>
                    </div>
                    <p className={cn(
                      `text-sm`, 
                      selectedFeatureIndex === index ? 'text-[hsl(var(--admin-primary-foreground))/0.9]' : 'text-[hsl(var(--admin-foreground)/0.7)]'
                    )}>
                      {feature.description}
                    </p>
                  </button>
                </div>
              ))}
            </div>
            
            {/* Mobile Scroll Indicators */}
            {features.length > 1 && (
              <div className="lg:hidden flex justify-center mt-4">
                <div className="flex space-x-2">
                  {features.map((_, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "transition-all duration-300 rounded-full",
                        selectedFeatureIndex === index 
                          ? "w-6 h-2 bg-[hsl(var(--admin-primary))]" 
                          : "w-2 h-2 bg-[hsl(var(--admin-primary)/0.4)]"
                      )}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop: 2x3 Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedFeatureIndex(index)}
                  className={cn(
                    `p-4 rounded-lg text-left transition-all border`, 
                    selectedFeatureIndex === index 
                      ? 'bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-primary-foreground))] shadow-md border-transparent' 
                      : 'bg-[hsl(var(--admin-card))] hover:bg-[hsl(var(--admin-muted))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-foreground))] '
                  )}
                >
                  <div className="flex items-center mb-2">
                    <div className={cn(
                      `w-8 h-8 rounded-md flex items-center justify-center mr-3 flex-shrink-0`, 
                      selectedFeatureIndex === index ? 'bg-white/20' : 'bg-[hsl(var(--admin-primary)/0.2)]'
                    )}>
                       {React.cloneElement(feature.icon, { className: cn(`w-5 h-5`, selectedFeatureIndex === index ? 'text-white' : 'text-[hsl(var(--admin-primary))] ') })}
                    </div>
                    <h4 className="font-semibold text-base">{feature.title}</h4>
                  </div>
                  <p className={cn(
                    `text-sm`, 
                    selectedFeatureIndex === index ? 'text-[hsl(var(--admin-primary-foreground))/0.9]' : 'text-[hsl(var(--admin-foreground)/0.7)]'
                  )}>
                    {feature.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
