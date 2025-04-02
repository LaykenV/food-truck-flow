'use client';

import { format, parse, addDays, differenceInMinutes } from 'date-fns'
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LucideClock } from "lucide-react"

interface ScheduleDay {
  day: string;
  location?: string;
  address?: string;
  hours?: string;
  openTime?: string;
  closeTime?: string;
  isClosed?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  closureTimestamp?: string;
}

interface TimeAvailabilityDisplayProps {
  isCurrentlyOpen: boolean;
  todaySchedule?: ScheduleDay;
}

export function TimeAvailabilityDisplay({ 
  isCurrentlyOpen, 
  todaySchedule 
}: TimeAvailabilityDisplayProps) {
  if (!todaySchedule || todaySchedule.isClosed) {
    return null;
  }
  
  const { openTime, closeTime } = todaySchedule;
  
  if (!openTime || !closeTime) {
    return null;
  }
  
  // Parse time strings to Date objects
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Parse times - handle 24-hour format like "14:30"
  const parseTimeString = (timeStr: string) => {
    if (!timeStr) return null;
    
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date(today);
      date.setHours(hours, minutes, 0, 0);
      return date;
    } catch (e) {
      console.error('Error parsing time:', e);
      return null;
    }
  };
  
  const openDate = parseTimeString(openTime);
  const closeDate = parseTimeString(closeTime);
  
  // Handle case where closing time is after midnight
  if (closeDate && openDate && closeDate < openDate) {
    closeDate.setDate(closeDate.getDate() + 1);
  }
  
  if (!openDate || !closeDate) {
    return null;
  }
  
  // Calculate time until opening or closing
  let timeUntil = 0;
  let message = '';
  
  if (isCurrentlyOpen) {
    // Calculate minutes until closing
    timeUntil = differenceInMinutes(closeDate, now);
    
    if (timeUntil <= 60) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <LucideClock className="h-3.5 w-3.5 text-admin-muted-foreground mr-1.5" />
                <p className="text-sm font-medium text-admin-foreground/80">
                  Closing soon
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-admin-secondary border border-admin-border">
              <p>Closing in {timeUntil} minutes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    const hours = Math.floor(timeUntil / 60);
    const minutes = timeUntil % 60;
    
    message = hours > 0 
      ? `${hours}h ${minutes}m until closing`
      : `${minutes}m until closing`;
  } else {
    // If current time is before opening time
    if (now < openDate) {
      timeUntil = differenceInMinutes(openDate, now);
      
      if (timeUntil <= 60) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <LucideClock className="h-3.5 w-3.5 text-admin-primary mr-1.5" />
                  <p className="text-sm font-medium text-admin-primary">
                    Opening soon
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-admin-secondary border border-admin-border">
                <p>Opening in {timeUntil} minutes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
      
      const hours = Math.floor(timeUntil / 60);
      const minutes = timeUntil % 60;
      
      message = hours > 0 
        ? `${hours}h ${minutes}m until opening`
        : `${minutes}m until opening`;
    } else {
      // If current time is after closing time, show next opening
      message = `Opens tomorrow at ${format(openDate, 'h:mm a')}`;
    }
  }
  
  return (
    <p className="text-xs text-admin-muted-foreground flex items-center">
      <LucideClock className="h-3 w-3 mr-1 inline-block" />
      {message}
    </p>
  );
} 