'use client';

import Image from 'next/image';
import React, { useState, useRef, UIEvent } from 'react';
import { cn } from '@/lib/utils';

// Define the number of placeholder testimonials
const testimonialCount = 3;

export function TestimonialsSection() {
  // State and ref for mobile scroll handling
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const totalWidth = container.scrollWidth - container.clientWidth;
    
    if (totalWidth <= 0) return;

    // Estimate card width - adjust if necessary based on spacing/padding
    // Assuming 3 cards for now
    const cardWidthEstimate = container.scrollWidth / testimonialCount;
    
    const centerScrollPosition = scrollLeft + container.clientWidth / 2;
    let newIndex = Math.floor(centerScrollPosition / cardWidthEstimate);

    newIndex = Math.max(0, Math.min(testimonialCount - 1, newIndex));

    if (newIndex !== selectedIndex) {
      setSelectedIndex(newIndex);
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--admin-primary)/0.05)] rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[hsl(var(--admin-gradient-end)/0.05)] rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[hsl(var(--admin-foreground))] mb-4">
            What Our <span className="text-[hsl(var(--admin-primary))]">Customers</span> Say
          </h2>
          <p className="text-xl text-[hsl(var(--admin-foreground)/0.8)] max-w-3xl mx-auto leading-relaxed">
            Join thousands of food truck owners who have transformed their business with our platform
          </p>
        </div>
        
        {/* Mobile: Scrollable horizontal card container */}
        <div 
          ref={scrollContainerRef}
          className="md:hidden flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
          onScroll={handleScroll}
        >
          {[...Array(testimonialCount)].map((_, index) => (
            <div 
              key={index} 
              className={cn(
                "min-w-[280px] w-[85vw] max-w-[340px] p-1 snap-center flex-shrink-0"
              )}
            >
              <div className="bg-[hsl(var(--admin-card))] h-full p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-[hsl(var(--admin-border))] flex flex-col relative overflow-hidden group">
                {/* Card background decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-[hsl(var(--admin-primary)/0.1)] rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[hsl(var(--admin-primary))] to-[hsl(var(--admin-gradient-end))] flex items-center justify-center text-white shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-[hsl(var(--admin-foreground))]">Coming Soon</h4>
                      <p className="text-[hsl(var(--admin-primary))] font-medium">Food Truck Owner</p>
                    </div>
                  </div>
                  
                  <div className="flex mb-6">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-[hsl(var(--admin-primary))]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  
                  <blockquote className="text-[hsl(var(--admin-foreground)/0.8)] italic flex-grow text-lg leading-relaxed">
                    "We're excited to share real customer testimonials soon. Be among the first to experience our platform!"
                  </blockquote>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Scroll Indicators */}
        {testimonialCount > 1 && (
          <div className="md:hidden flex justify-center mt-8">
            <div className="flex space-x-2">
              {[...Array(testimonialCount)].map((_, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "transition-all duration-300 rounded-full",
                    selectedIndex === index 
                      ? "w-8 h-2 bg-[hsl(var(--admin-primary))]" 
                      : "w-2 h-2 bg-[hsl(var(--admin-primary)/0.4)]"
                  )}
                ></div>
              ))}
            </div>
          </div>
        )}

        {/* Desktop: Grid layout */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(testimonialCount)].map((_, index) => (
            <div key={index} className="bg-[hsl(var(--admin-card))] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-[hsl(var(--admin-border))] flex flex-col h-full relative overflow-hidden group">
              {/* Card background decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-[hsl(var(--admin-primary)/0.1)] rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[hsl(var(--admin-primary))] to-[hsl(var(--admin-gradient-end))] flex items-center justify-center text-white shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-[hsl(var(--admin-foreground))]">Coming Soon</h4>
                    <p className="text-[hsl(var(--admin-primary))] font-medium">Food Truck Owner</p>
                  </div>
                </div>
                
                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[hsl(var(--admin-primary))]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <blockquote className="text-[hsl(var(--admin-foreground)/0.8)] italic flex-grow text-lg leading-relaxed">
                  "We're excited to share real customer testimonials soon. Be among the first to experience our platform!"
                </blockquote>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 