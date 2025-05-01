'use client';

import { 
  toZonedTime, 
  format 
} from 'date-fns-tz';
import { 
  startOfDay, 
  parse, 
  setHours, 
  setMinutes, 
  addDays, 
  isBefore, 
  isAfter, 
  isEqual 
} from 'date-fns';

interface ScheduleDay {
  day: string;
  location?: string;
  address?: string;
  hours?: string; // Legacy format
  openTime?: string; // Format: "HH:MM"
  closeTime?: string; // Format: "HH:MM"
  isClosed?: boolean;
  timezone?: string; // IANA timezone name
  closureTimestamp?: string; // ISO string (UTC)
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Determines if a food truck is currently open based on schedule data.
 * Client-side, timezone-aware implementation.
 * @param scheduleDay The schedule day object to check.
 * @returns boolean indicating if the food truck is currently open.
 */
export function isScheduledOpen(scheduleDay: ScheduleDay | undefined): boolean {
  if (!scheduleDay) return false;

  const scheduleTimezone = scheduleDay.timezone || 'America/New_York'; // Fallback timezone
  const now = new Date(); // User's local time
  const startOfTodayInScheduleTimezone = startOfDay(toZonedTime(now, scheduleTimezone));

  // Check manual closure status first
  if (scheduleDay.isClosed) {
    // Check if the closure is outdated (from a previous day in the schedule's timezone)
    if (scheduleDay.closureTimestamp) {
      const closureDateUtc = new Date(scheduleDay.closureTimestamp);
      // If closure time is before the start of *today* in the schedule's timezone, it's outdated.
      if (isBefore(closureDateUtc, startOfTodayInScheduleTimezone)) {
        // Outdated closure, treat as potentially open based on hours
        return checkIfOpenBasedOnHours(scheduleDay, scheduleTimezone);
      } else {
        // Valid closure for today, truck is closed.
        return false;
      }
    } else {
      // isClosed is true but no timestamp, assume it's a current manual closure.
      return false;
    }
  }

  // If not manually closed (or closure was outdated), check based on hours.
  return checkIfOpenBasedOnHours(scheduleDay, scheduleTimezone);
}

/**
 * Helper function to check if truck is open based on hours within a specific timezone.
 * Client-side version (no 15-min buffer).
 * @param scheduleDay The schedule day to check.
 * @param timezone The IANA timezone string for this schedule entry.
 * @returns boolean indicating if truck is open based on hours.
 */
function checkIfOpenBasedOnHours(scheduleDay: ScheduleDay, timezone: string): boolean {
  if (!scheduleDay.openTime || !scheduleDay.closeTime) {
    // Handle legacy 'hours' field if needed
    console.warn(`Missing openTime or closeTime for schedule day ${scheduleDay.day}, cannot determine status.`);
    return false;
  }

  try {
    const now = new Date(); // User's local time
    const nowInScheduleTimezone = toZonedTime(now, timezone);
    const startOfTodayInScheduleTimezone = startOfDay(nowInScheduleTimezone);

    // Parse openTime and closeTime ("HH:MM") relative to the start of the day in the specified timezone
    const [openHour, openMinute] = scheduleDay.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = scheduleDay.closeTime.split(':').map(Number);

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

    // Check if current time is within the open/close range
    return (isAfter(nowInScheduleTimezone, openDateTime) || isEqual(nowInScheduleTimezone, openDateTime)) &&
           isBefore(nowInScheduleTimezone, closeDateTime);

  } catch (error) {
    console.error(`Error parsing structured hours for timezone ${timezone}:`, error);
    return false;
  }
}

/**
 * Formats a time range from 24h format to 12h display format, including timezone.
 * @param openTime Opening time in 24h format (HH:MM).
 * @param closeTime Closing time in 24h format (HH:MM).
 * @param timezone IANA timezone name (e.g., "America/New_York").
 * @returns Formatted time range string (e.g., "11:00 AM - 2:00 PM PDT").
 */
export function formatTimeRange(openTime?: string, closeTime?: string, timezone?: string): string {
  if (!openTime || !closeTime) return '';
  
  try {
    // Parse the 24h times
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    
    // Format to 12h time
    const formatTime12h = (hour: number, minute: number) => {
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12; // Convert hour 0 to 12 for 12 AM
      return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
    };
    
    const formattedOpenTime = formatTime12h(openHour, openMinute);
    const formattedCloseTime = formatTime12h(closeHour, closeMinute);
    
    let tzAbbreviation = '';
    if (timezone) {
      try {
         // Use a current date just to get the correct abbreviation (handles DST)
        tzAbbreviation = format(new Date(), 'zzz', { timeZone: timezone });
      } catch (tzError) {
        console.error(`Error formatting timezone abbreviation for ${timezone}:`, tzError);
        tzAbbreviation = timezone; // Fallback to full name on error
      }
    }

    return `${formattedOpenTime} - ${formattedCloseTime}${tzAbbreviation ? ` ${tzAbbreviation}` : ''}`;
  } catch (error) {
    console.error('Error formatting time range:', error);
    return ''; // Return empty string on error
  }
}

/**
 * Gets the current day's schedule based on the *viewer's* local time.
 * This remains unchanged as it's for finding the day entry relevant to the viewer.
 * @param schedule Array of schedule days.
 * @returns The schedule for today (viewer's local), or undefined if not found.
 */
export function getTodaySchedule(schedule: ScheduleDay[]): ScheduleDay | undefined {
  // Get day name based on viewer's local timezone
  const today = format(new Date(), 'EEEE'); 
  return schedule.find(day => day.day === today);
} 

// Note: Legacy 'hours' parsing logic is omitted here as well for consistency 
// and reliability with timezones. 