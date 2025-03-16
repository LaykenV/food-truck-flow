'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { DisplayMode } from '.';
import { useMemo } from 'react';

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
        const prevDayIndex = daysOfWeek.indexOf(prevDay.day);
        const currentDayIndex = daysOfWeek.indexOf(day.day);
        
        // Check if days are consecutive and at the same location
        const isConsecutive = (currentDayIndex === prevDayIndex + 1) || 
                             (prevDayIndex === 6 && currentDayIndex === 0); // Sunday to Monday
        const isSameLocation = day.location === prevDay.location && 
                              day.address === prevDay.address &&
                              day.hours === prevDay.hours;
        
        if (isConsecutive && isSameLocation) {
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
  }, [scheduleDays]);
  
  // Create a map of days that have schedules for quick lookup
  const scheduledDaysMap = useMemo(() => {
    const map = new Map();
    scheduleDays.forEach(day => {
      map.set(day.day, day);
    });
    return map;
  }, [scheduleDays]);
  
  return (
    <section id="schedule-section" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4" style={{ color: primaryColor }}>
            {schedule?.title || 'Our Schedule'}
          </h2>
          <p className="text-gray-600 text-lg">
            {schedule?.description || 'Find us at these locations throughout the week.'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Render grouped schedule days */}
          {groupedScheduleDays.map((group, groupIndex) => {
            const firstDay = group[0];
            const lastDay = group[group.length - 1];
            const dayRange = group.length === 1 
              ? firstDay.day 
              : `${firstDay.day} - ${lastDay.day}`;
              
            return (
              <Card key={groupIndex} className="border-l-4 hover:shadow-md transition-shadow" style={{ borderLeftColor: primaryColor }}>
                <CardContent className="pt-6">
                  <div className="flex flex-col">
                    <div className="flex items-center mb-4">
                      <Calendar className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
                      <h3 className="font-bold text-lg" style={{ color: primaryColor }}>{dayRange}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      {firstDay.location && (
                        <p className="font-medium">{firstDay.location}</p>
                      )}
                      {firstDay.address && (
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-1 mt-1 flex-shrink-0" style={{ color: secondaryColor }} />
                          <p className="text-gray-600 text-sm">{firstDay.address}</p>
                        </div>
                      )}
                      {firstDay.hours && (
                        <div className="flex items-start">
                          <Clock className="h-4 w-4 mr-1 mt-1 flex-shrink-0" style={{ color: secondaryColor }} />
                          <p className="text-gray-600 text-sm">{firstDay.hours}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {/* Render empty days */}
          {daysOfWeek.filter(day => !scheduledDaysMap.has(day)).map(day => (
            <Card key={day} className="hover:shadow-md transition-shadow border border-gray-200">
              <CardContent className="pt-6">
                <div className="flex flex-col">
                  <div className="flex items-center mb-4">
                    <Calendar className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
                    <h3 className="font-bold text-lg" style={{ color: primaryColor }}>{day}</h3>
                  </div>
                  <p className="text-gray-500 italic">Not scheduled</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Future Google Maps integration placeholder */}
        {scheduleDays.some(day => day.coordinates) && (
          <div className="mt-12 p-4 border border-dashed rounded-lg bg-gray-50 text-center" 
               style={{ borderColor: primaryColor }}>
            <p className="text-gray-500">
              Google Maps integration coming soon! You'll be able to see all our locations on a map.
            </p>
          </div>
        )}
      </div>
    </section>
  );
} 