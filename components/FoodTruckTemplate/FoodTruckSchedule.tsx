'use client';

import { useState, useEffect } from 'react';
import { ScheduleCard, ScheduleDayGroup } from '@/components/ui/schedule-card';
import { DisplayMode } from '.';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

// Define ScheduleDay type inline or import from a shared location
interface ScheduleDay {
  day: string;
  location?: string;
  address?: string;
  openTime?: string; 
  closeTime?: string;
  isClosed?: boolean;
  timezone?: string; // Added timezone field
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface FoodTruckScheduleProps {
  config: {
    schedule?: {
      title?: string;
      description?: string;
      days?: ScheduleDay[]; // Use the defined interface
    };
    primaryColor?: string;
    secondaryColor?: string;
  };
  displayMode: DisplayMode;
  forceViewMode?: 'mobile' | 'desktop';
}

export default function FoodTruckSchedule({ config, displayMode, forceViewMode }: FoodTruckScheduleProps) {
  // State for active card in mobile carousel
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  // State to track if mobile view should be used
  const [isMobileView, setIsMobileView] = useState(forceViewMode === 'mobile');
  
  // Update isMobileView when forceViewMode changes or on screen resize
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

  // Extract configuration data with defaults
  const { schedule } = config;
  const primaryColor = config.primaryColor || '#FF6B35';
  const secondaryColor = config.secondaryColor || '#FF9A7B';
  
  // Default schedule days if none provided
  const scheduleDays = schedule?.days || [];
  
  // Days of the week for display order
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Group consecutive days at the same location
  const groupedScheduleDays = useMemo(() => {
    const days: ScheduleDay[] = [...scheduleDays]; // Ensure type is applied
    
    // Sort days by day of week
    days.sort((a, b) => {
      return daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
    });
    
    // Group consecutive days at the same location
    const groups: ScheduleDayGroup[] = [];
    let currentGroup: typeof days = [];
    
    days.forEach((day, index) => {
      if (index === 0) {
        currentGroup.push(day);
      } else {
        const prevDay = days[index - 1];
        const prevDayIndex = daysOfWeek.indexOf(prevDay.day);
        const currentDayIndex = daysOfWeek.indexOf(day.day);
        
        // Check if days are consecutive and at the same location
        const isConsecutive = (currentDayIndex === prevDayIndex + 1) || 
                             (prevDayIndex === 6 && currentDayIndex === 0); // Sunday to Monday
        const isSameLocation = day.location === prevDay.location && 
                              day.address === prevDay.address &&
                              day.openTime === prevDay.openTime &&
                              day.closeTime === prevDay.closeTime &&
                              day.isClosed === prevDay.isClosed &&
                              day.timezone === prevDay.timezone; // Include timezone in comparison for grouping
        
        if (isConsecutive && isSameLocation) {
          currentGroup.push(day);
        } else {
          const firstDay = currentGroup[0];
          const lastDay = currentGroup[currentGroup.length - 1];
          const dayRange = currentGroup.length === 1 
            ? firstDay.day 
            : `${firstDay.day} - ${lastDay.day}`;

          groups.push({
            days: [...currentGroup],
            dayRange
          });
          currentGroup = [day];
        }
      }
    });
    
    if (currentGroup.length > 0) {
      const firstDay = currentGroup[0];
      const lastDay = currentGroup[currentGroup.length - 1];
      const dayRange = currentGroup.length === 1 
        ? firstDay.day 
        : `${firstDay.day} - ${lastDay.day}`;

      groups.push({
        days: [...currentGroup],
        dayRange
      });
    }
    
    return groups;
  }, [scheduleDays, daysOfWeek]);

  // Handle scroll events for carousel
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollLeft;
    const cardWidth = container.scrollWidth / groupedScheduleDays.length;
    const newActiveIndex = Math.round(scrollPosition / cardWidth);
    
    if (newActiveIndex !== activeCardIndex) {
      setActiveCardIndex(newActiveIndex);
    }
  };
  
  // If no schedule days, show a message
  if (scheduleDays.length === 0) {
    return (
      <section id="locations" className="py-12 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4" 
              style={{ color: '#000000', opacity: 0.8 }}
            >
              {schedule?.title || 'Our Schedule'}
            </h2>
            <div 
              className="w-16 h-1 mx-auto mb-6"
              style={{ backgroundColor: primaryColor }}
            ></div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Schedule information coming soon!
            </p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section id="schedule-section" className="py-12 sm:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4" 
            style={{ color: '#000000', opacity: 0.8 }}
          >
            {schedule?.title || 'Find Our Truck'}
          </h2>
          <div 
            className="w-16 h-1 mx-auto mb-6"
            style={{ backgroundColor: primaryColor }}
          ></div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {schedule?.description || 'Check out our weekly schedule and locations'}
          </p>
        </div>
        
        {/* Side-scrolling container for mobile */}
        <div className="relative">
          <div 
            className={cn(
              "flex overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide",
              isMobileView 
                ? "flex flex-row" 
                : displayMode === 'preview'
                  ? "md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:overflow-x-visible md:pb-0"
                  : "md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 md:overflow-x-visible md:pb-0"
            )}
            onScroll={handleScroll}
          >
            {/* Render grouped schedule days */}
            {groupedScheduleDays.map((group, groupIndex) => (
              <div 
                key={groupIndex} 
                className={cn(
                  isMobileView ? "min-w-[280px] w-[85vw] max-w-[340px] px-1 mr-3 snap-center flex-shrink-0" : "md:w-auto md:min-w-0 md:max-w-none md:mr-0"
                )}
              >
                <ScheduleCard
                  group={group} // group.days contains ScheduleDay objects, including timezone
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
              </div>
            ))}
          </div>
          
          {/* Improved scroll indicators for mobile */}
          {groupedScheduleDays.length > 1 && isMobileView && (
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                {groupedScheduleDays.map((_, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "transition-all duration-300",
                      activeCardIndex === index 
                        ? "w-6 h-2 rounded-full" 
                        : "w-2 h-2 rounded-full opacity-70"
                    )}
                    style={{ 
                      backgroundColor: 
                        activeCardIndex === index 
                          ? secondaryColor 
                          : `color-mix(in srgb, ${secondaryColor} 30%, white)` 
                    }}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 