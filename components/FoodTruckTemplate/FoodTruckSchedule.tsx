'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { DisplayMode } from '.';
import { useMemo } from 'react';
import MapComponent from '../MapComponent';

export interface FoodTruckScheduleProps {
  config: {
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
    primaryColor?: string;
    secondaryColor?: string;
  };
  displayMode: DisplayMode;
  forceViewMode?: 'mobile' | 'desktop';
}

export default function FoodTruckSchedule({ config, displayMode }: FoodTruckScheduleProps) {
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
    const days = [...scheduleDays];
    
    // Sort days by day of week
    days.sort((a, b) => {
      return daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
    });
    
    // Group consecutive days at the same location
    const groups: any[] = [];
    let currentGroup: any[] = [];
    
    days.forEach((day, index) => {
      if (index === 0) {
        currentGroup.push(day);
      } else {
        const prevDay = days[index - 1];
        
        // Check if consecutive days and same location
        const isPrevDayConsecutive = 
          (daysOfWeek.indexOf(day.day) - daysOfWeek.indexOf(prevDay.day) === 1) ||
          (prevDay.day === 'Sunday' && day.day === 'Monday');
          
        const isSameLocation = 
          day.location === prevDay.location && 
          day.address === prevDay.address;
          
        if (isPrevDayConsecutive && isSameLocation) {
          currentGroup.push(day);
        } else {
          groups.push([...currentGroup]);
          currentGroup = [day];
        }
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  }, [scheduleDays, daysOfWeek]);
  
  // If no schedule days, show a message
  if (scheduleDays.length === 0) {
    return (
      <section id="locations" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4" 
              style={{ color: secondaryColor }}
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
    <section id="locations" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4" 
            style={{ color: secondaryColor }}
          >
            {schedule?.title || 'Find Our Truck'}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {schedule?.description || 'Check out our weekly schedule and locations'}
          </p>
        </div>
        
        {/* Side-scrolling container for mobile */}
        <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex overflow-x-auto pb-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 snap-x snap-mandatory md:overflow-x-visible md:pb-0">
            {/* Render grouped schedule days */}
            {groupedScheduleDays.map((group, groupIndex) => {
              const firstDay = group[0];
              const lastDay = group[group.length - 1];
              const dayRange = group.length === 1 
                ? firstDay.day 
                : `${firstDay.day} - ${lastDay.day}`;
                
              return (
                <div 
                  key={groupIndex} 
                  className="min-w-[280px] max-w-[280px] mr-4 md:mr-0 md:min-w-0 md:max-w-none snap-start"
                >
                  <Card className="h-full">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex items-center mb-4">
                          <div 
                            className="p-2 rounded-full mr-3"
                            style={{ 
                              backgroundColor: `color-mix(in srgb, ${secondaryColor} 20%, white)` 
                            }}
                          >
                            <MapPin 
                              className="h-4 w-4" 
                              style={{ color: secondaryColor }}
                            />
                          </div>
                          <h3 className="font-bold text-lg">{firstDay.location || 'Location'}</h3>
                        </div>
                        {firstDay.address && (
                          <p className="text-muted-foreground mb-4">{firstDay.address}</p>
                        )}
                      </div>
                      
                      {/* Map Component */}
                      {firstDay.address && (
                        <div className="mb-4">
                          <MapComponent address={firstDay.address} height="150px" />
                        </div>
                      )}
                      
                      <div className="p-4 border-t border-border">
                        <div className="flex items-center">
                          <div 
                            className="p-2 rounded-full mr-3"
                            style={{ 
                              backgroundColor: `color-mix(in srgb, ${primaryColor} 20%, white)` 
                            }}
                          >
                            <Calendar 
                              className="h-4 w-4" 
                              style={{ color: primaryColor }}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{dayRange}</p>
                            <p className="text-muted-foreground text-sm">{firstDay.hours || 'Check our social media for hours'}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
          
          {/* Scroll indicators for mobile */}
          <div className="flex justify-center mt-4 md:hidden">
            <div className="flex space-x-2">
              {groupedScheduleDays.map((_, index) => (
                <div 
                  key={index} 
                  className="w-2 h-2 rounded-full"
                  style={{ 
                    backgroundColor: index === 0 
                      ? secondaryColor 
                      : `color-mix(in srgb, ${secondaryColor} 30%, white)` 
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 