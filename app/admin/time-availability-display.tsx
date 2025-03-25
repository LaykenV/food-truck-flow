'use client';

import { formatTimeRange } from "@/lib/schedule-utils";

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

interface TimeAvailabilityProps {
  isCurrentlyOpen: boolean;
  todaySchedule: ScheduleDay;
}

export function TimeAvailabilityDisplay({ isCurrentlyOpen, todaySchedule }: TimeAvailabilityProps) {
  return (
    <p className="text-xs text-muted-foreground mt-1">
      {isCurrentlyOpen 
        ? 'Currently accepting orders' 
        : todaySchedule.isClosed
        ? todaySchedule.closureTimestamp
          ? 'Not accepting orders (emergency closure for today only)'
          : 'Not accepting orders (manually closed)'
        : todaySchedule.openTime && todaySchedule.closeTime 
          ? 'Not currently accepting orders' 
          : 'No hours set for today'}
    </p>
  );
} 