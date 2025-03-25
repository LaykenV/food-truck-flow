'use client';

interface ScheduleDay {
  day: string;
  location?: string;
  address?: string;
  hours?: string;
  openTime?: string; 
  closeTime?: string;
  isClosed?: boolean;
  closureTimestamp?: string; // Timestamp when isClosed was set to true
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Determines if a food truck is currently open based on schedule data
 * @param scheduleDay The schedule day object to check
 * @returns boolean indicating if the food truck is currently open
 */
export function isScheduledOpen(scheduleDay: ScheduleDay | undefined): boolean {
  if (!scheduleDay) return false;
  
  // Check if we need to automatically reset the isClosed flag
  if (scheduleDay.isClosed && scheduleDay.closureTimestamp) {
    const closureDate = new Date(scheduleDay.closureTimestamp);
    const now = new Date();
    
    // Reset isClosed if it's a new day compared to when it was closed
    if (closureDate.getDate() !== now.getDate() || 
        closureDate.getMonth() !== now.getMonth() ||
        closureDate.getFullYear() !== now.getFullYear()) {
      // This is a different day than when it was closed, so it should auto-reset
      return checkIfOpenBasedOnHours(scheduleDay);
    }
  }
  
  // If manually marked as closed and closure is still valid for today, return false
  if (scheduleDay.isClosed) return false;
  
  return checkIfOpenBasedOnHours(scheduleDay);
}

/**
 * Helper function to check if truck is open based on hours
 * @param scheduleDay The schedule day to check
 * @returns boolean indicating if truck is open based on hours
 */
function checkIfOpenBasedOnHours(scheduleDay: ScheduleDay): boolean {
  const now = new Date();
  
  // First check structured time fields if available
  if (scheduleDay.openTime && scheduleDay.closeTime) {
    try {
      // Parse openTime and closeTime (HH:MM format)
      const [openHour, openMinute] = scheduleDay.openTime.split(':').map(Number);
      const [closeHour, closeMinute] = scheduleDay.closeTime.split(':').map(Number);
      
      // Create date objects for comparison
      const openTime = new Date();
      openTime.setHours(openHour, openMinute, 0, 0);
      
      const closeTime = new Date();
      closeTime.setHours(closeHour, closeMinute, 0, 0);
      
      // Handle overnight hours (when close time is earlier than open time)
      if (closeHour < openHour || (closeHour === openHour && closeMinute < openMinute)) {
        closeTime.setDate(closeTime.getDate() + 1);
      }
      
      return now >= openTime && now <= closeTime;
    } catch (error) {
      console.error('Error parsing structured hours:', error);
      // Fall back to string parsing if structured time fails
    }
  }
  
  // Fall back to string parsing for legacy data
  if (scheduleDay.hours) {
    try {
      // Parse hours like "11:00 AM - 2:00 PM"
      const hoursMatch = scheduleDay.hours.match(/(\d+):(\d+)\s+(AM|PM)\s+-\s+(\d+):(\d+)\s+(AM|PM)/i);
      
      if (!hoursMatch) return false;
      
      let [_, startHour, startMinute, startAmPm, endHour, endMinute, endAmPm] = hoursMatch;
      
      // Convert to 24-hour format
      let startHour24 = parseInt(startHour);
      if (startAmPm.toUpperCase() === 'PM' && startHour24 < 12) startHour24 += 12;
      if (startAmPm.toUpperCase() === 'AM' && startHour24 === 12) startHour24 = 0;
      
      let endHour24 = parseInt(endHour);
      if (endAmPm.toUpperCase() === 'PM' && endHour24 < 12) endHour24 += 12;
      if (endAmPm.toUpperCase() === 'AM' && endHour24 === 12) endHour24 = 0;
      
      // Create date objects for comparison
      const startTime = new Date();
      startTime.setHours(startHour24, parseInt(startMinute), 0, 0);
      
      const endTime = new Date();
      endTime.setHours(endHour24, parseInt(endMinute), 0, 0);
      
      // Handle overnight hours
      if (endHour24 < startHour24 || (endHour24 === startHour24 && parseInt(endMinute) < parseInt(startMinute))) {
        endTime.setDate(endTime.getDate() + 1);
      }
      
      return now >= startTime && now <= endTime;
    } catch (error) {
      console.error('Error parsing hours:', error);
    }
  }
  
  return false;
}

/**
 * Formats a time range from 24h format to 12h display format
 * @param openTime Opening time in 24h format (HH:MM)
 * @param closeTime Closing time in 24h format (HH:MM)
 * @returns Formatted time range string (e.g., "11:00 AM - 2:00 PM")
 */
export function formatTimeRange(openTime?: string, closeTime?: string): string {
  if (!openTime || !closeTime) return '';
  
  try {
    // Parse the 24h times
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    
    // Format to 12h time
    const formatTime = (hour: number, minute: number) => {
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
    };
    
    const formattedOpenTime = formatTime(openHour, openMinute);
    const formattedCloseTime = formatTime(closeHour, closeMinute);
    
    return `${formattedOpenTime} - ${formattedCloseTime}`;
  } catch (error) {
    console.error('Error formatting time range:', error);
    return '';
  }
}

/**
 * Gets the current day's schedule
 * @param schedule Array of schedule days
 * @returns The schedule for today, or undefined if not found
 */
export function getTodaySchedule(schedule: ScheduleDay[]): ScheduleDay | undefined {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  return schedule.find(day => day.day === today);
} 