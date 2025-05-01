import { toZonedTime, format } from 'date-fns-tz';
import { 
  startOfDay, 
  parse, 
  setHours, 
  setMinutes, 
  addDays, 
  isBefore, 
  isAfter, 
  isEqual,
  subMinutes 
} from 'date-fns';

interface ScheduleDay {
  day: string;
  location?: string;
  address?: string;
  hours?: string; // Legacy format
  openTime?: string; // Format: "HH:MM"
  closeTime?: string; // Format: "HH:MM"
  isClosed?: boolean;
  timezone?: string; // IANA timezone name (e.g., "America/New_York")
  closureTimestamp?: string; // ISO string (UTC)
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Determines if a food truck is currently open based on schedule data.
 * Server-side, timezone-aware implementation.
 * @param scheduleDay The schedule day object to check.
 * @returns boolean indicating if the food truck is currently open.
 */
export function isScheduledOpenServer(scheduleDay: ScheduleDay | undefined): boolean {
  if (!scheduleDay) return false;

  const scheduleTimezone = scheduleDay.timezone || 'America/New_York'; // Fallback timezone
  const nowUtc = new Date();
  const nowInScheduleTimezone = toZonedTime(nowUtc, scheduleTimezone);
  const startOfTodayInScheduleTimezone = startOfDay(nowInScheduleTimezone);

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
 * Handles HH:MM format and 15-minute buffer.
 * @param scheduleDay The schedule day to check.
 * @param timezone The IANA timezone string for this schedule entry.
 * @returns boolean indicating if truck is open based on hours.
 */
function checkIfOpenBasedOnHours(scheduleDay: ScheduleDay, timezone: string): boolean {
  if (!scheduleDay.openTime || !scheduleDay.closeTime) {
     // Consider handling legacy 'hours' string here if necessary, 
     // potentially by converting it first or using a separate parsing logic.
     // For now, require openTime and closeTime for timezone logic.
    console.warn(`Missing openTime or closeTime for schedule day ${scheduleDay.day}, cannot determine status.`);
    return false;
  }

  try {
    const nowUtc = new Date();
    const nowInScheduleTimezone = toZonedTime(nowUtc, timezone);
    const startOfTodayInScheduleTimezone = startOfDay(nowInScheduleTimezone);

    // Parse openTime and closeTime ("HH:MM") relative to the start of the day in the specified timezone
    const [openHour, openMinute] = scheduleDay.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = scheduleDay.closeTime.split(':').map(Number);

    let openDateTime = setMinutes(setHours(startOfTodayInScheduleTimezone, openHour), openMinute);
    let closeDateTime = setMinutes(setHours(startOfTodayInScheduleTimezone, closeHour), closeMinute);

    // Handle overnight schedules: if close time is on or before open time, add a day to close time
    if (isBefore(closeDateTime, openDateTime) || isEqual(closeDateTime, openDateTime)) {
      closeDateTime = addDays(closeDateTime, 1);
      // If the current time is before the open time, it might belong to the *previous* day's overnight schedule
      if (isBefore(nowInScheduleTimezone, openDateTime)) {
         // Adjust both open and close times back by one day to check against yesterday's closing time
         openDateTime = addDays(openDateTime, -1);
         closeDateTime = addDays(closeDateTime, -1); 
      }
    }
    
    // Check if current time is within the open/close range
    const isOpen = (isAfter(nowInScheduleTimezone, openDateTime) || isEqual(nowInScheduleTimezone, openDateTime)) &&
                   isBefore(nowInScheduleTimezone, closeDateTime);

    if (!isOpen) return false;

    // Check 15-minute buffer before closing time
    const fifteenMinutesBeforeClose = subMinutes(closeDateTime, 15);
    if (isAfter(nowInScheduleTimezone, fifteenMinutesBeforeClose) || isEqual(nowInScheduleTimezone, fifteenMinutesBeforeClose)) {
      // Within 15 mins of closing or exactly at the 15-min mark
      return false; 
    }

    return true; // Open and outside the 15-min buffer

  } catch (error) {
    console.error(`Error parsing structured hours for timezone ${timezone}:`, error);
    return false; 
  }
}

/**
 * Gets the schedule entry for the current day, based on the primary timezone.
 * Server-side, timezone-aware implementation.
 * @param schedule Array of schedule days.
 * @param primaryTimezone The primary IANA timezone for the truck (optional, defaults).
 * @returns The schedule for "today" based on the primary timezone, or undefined.
 */
export function getTodayScheduleServer(
  schedule: ScheduleDay[], 
  primaryTimezone: string = 'America/New_York' // Default/Fallback primary timezone
): ScheduleDay | undefined {
  try {
    const nowInPrimaryZone = toZonedTime(new Date(), primaryTimezone);
    // 'EEEE' gives the full day name, e.g., "Monday"
    const todayName = format(nowInPrimaryZone, 'EEEE', { timeZone: primaryTimezone }); 
    return schedule.find(day => day.day === todayName);
  } catch (error) {
     console.error(`Error determining today's schedule for timezone ${primaryTimezone}:`, error);
     // Fallback to simple local day name if timezone calculation fails? Or return undefined?
     // Let's return undefined on error to avoid potentially wrong data.
     return undefined;
  }
}
