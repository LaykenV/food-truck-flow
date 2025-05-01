'use client';

import { format, parse, addDays, differenceInMinutes } from 'date-fns'
import { toZonedTime, format as formatTz } from 'date-fns-tz'
import { startOfDay, setHours, setMinutes, isBefore, isEqual } from 'date-fns'
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
  timezone?: string;
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
  
  const { openTime, closeTime, timezone } = todaySchedule;
  
  if (!openTime || !closeTime) {
    return null;
  }
  
  // --- TIMEZONE CHANGES START ---
  const scheduleTimezone = timezone || 'America/New_York'; // Fallback timezone
  
  try {
    const nowUtc = new Date();
    const nowInScheduleTimezone = toZonedTime(nowUtc, scheduleTimezone);
    const startOfTodayInScheduleTimezone = startOfDay(nowInScheduleTimezone);

    // Parse openTime and closeTime ("HH:MM") relative to the start of the day in the specified timezone
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);

    let openDateTime = setMinutes(setHours(startOfTodayInScheduleTimezone, openHour), openMinute);
    let closeDateTime = setMinutes(setHours(startOfTodayInScheduleTimezone, closeHour), closeMinute);

    // Handle overnight schedules
    if (isBefore(closeDateTime, openDateTime) || isEqual(closeDateTime, openDateTime)) {
      closeDateTime = addDays(closeDateTime, 1);
      // Adjust check for current time potentially belonging to previous day's schedule
      if (isBefore(nowInScheduleTimezone, openDateTime)) {
         openDateTime = addDays(openDateTime, -1);
         closeDateTime = addDays(closeDateTime, -1); 
      }
    }
  // --- TIMEZONE CHANGES END ---
  
  // Calculate time until opening or closing
  let timeUntil = 0;
  let message = '';
  
  if (isCurrentlyOpen) {
    // Calculate minutes until closing using timezone-aware dates
    timeUntil = differenceInMinutes(closeDateTime, nowInScheduleTimezone);
    
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
    // If current time is before opening time (using timezone-aware dates)
    if (isBefore(nowInScheduleTimezone, openDateTime)) {
      timeUntil = differenceInMinutes(openDateTime, nowInScheduleTimezone);
      
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
      // If current time is after closing time, show next opening (formatted in schedule timezone)
      // Note: This doesn't account for the *next* scheduled day, just formats today's open time.
      // A more complex implementation would look ahead in the schedule.
      const formattedOpenTime = formatTz(openDateTime, 'h:mm a', { timeZone: scheduleTimezone });
      message = `Opens at ${formattedOpenTime}`; // Simplified message
    }
  }
  
  return (
    <p className="text-xs text-admin-muted-foreground flex items-center">
      <LucideClock className="h-3 w-3 mr-1 inline-block" />
      {message}
    </p>
  );
} catch (error) {
    console.error(`Error calculating time availability for timezone ${scheduleTimezone}:`, error);
    return null; // Don't render anything on error
  }
} 