'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { toZonedTime, format } from 'date-fns-tz';
import { startOfDay, isBefore } from 'date-fns';

interface ScheduleDay {
  day: string;
  location?: string;
  address?: string;
  hours?: string;
  openTime?: string; // Format: "HH:MM" in 24h format 
  closeTime?: string; // Format: "HH:MM" in 24h format
  isClosed?: boolean; // Override to mark as closed regardless of time
  timezone?: string;
  closureTimestamp?: string; // Timestamp when isClosed was set to true
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export async function updateSchedule(
  schedule: ScheduleDay[], 
  title?: string, 
  description?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('You must be logged in to update your schedule');
  }
  
  // Fetch the food truck
  const { data: foodTruck, error: fetchError } = await supabase
    .from('FoodTrucks')
    .select('*')
    .eq('user_id', user.id)
    .single();
    
  if (fetchError) {
    throw new Error('Failed to fetch food truck data');
  }
  
  // Update the configuration with the new schedule
  const updatedConfig = {
    ...foodTruck.configuration,
    schedule: {
      ...foodTruck.configuration.schedule,
      days: schedule,
      // Only update title and description if provided
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description })
    }
  };
  
  // Save the updated configuration
  const { error: updateError } = await supabase
    .from('FoodTrucks')
    .update({
      configuration: updatedConfig,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id);
    
  if (updateError) {
    throw new Error('Failed to update schedule');
  }
  
  // Revalidate the dashboard page and schedule page
  revalidatePath('/admin');
  
  return { success: true, timestamp: new Date() };
}

// Action to toggle closed status for today
export async function toggleTodayClosed(isClosed: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  // Fetch food truck data
  const { data: foodTruck } = await supabase
    .from('FoodTrucks')
    .select('*')
    .eq('user_id', user?.id)
    .single();
  
  if (!foodTruck) {
    throw new Error('Food truck not found');
  }
  
  // Determine the primary timezone (use a fallback if not set)
  const primaryTimezone = foodTruck.configuration?.schedule?.primaryTimezone || 'America/New_York'; // Use your desired fallback
  
  // Get today's day name in the truck's primary timezone
  const nowInPrimaryZone = toZonedTime(new Date(), primaryTimezone);
  const today = format(nowInPrimaryZone, 'EEEE', { timeZone: primaryTimezone });
  
  // Update the configuration with the toggled closed status
  const updatedConfig = { ...foodTruck.configuration };
  
  // Find today's schedule
  if (updatedConfig.schedule && updatedConfig.schedule.days) {
    const todayScheduleIndex = updatedConfig.schedule.days.findIndex((day: ScheduleDay) => day.day === today);
    
    if (todayScheduleIndex !== -1) {
      updatedConfig.schedule.days[todayScheduleIndex].isClosed = isClosed;
      
      // Store the timestamp when isClosed was set to true
      if (isClosed) {
        // Add a closure timestamp to track when it was closed
        updatedConfig.schedule.days[todayScheduleIndex].closureTimestamp = new Date().toISOString();
      } else {
        // Remove the timestamp when reopening
        delete updatedConfig.schedule.days[todayScheduleIndex].closureTimestamp;
      }
    }
  }
  
  // Save the updated configuration
  const { error: updateError } = await supabase
    .from('FoodTrucks')
    .update({
      configuration: updatedConfig,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id);
  
  if (updateError) {
    throw new Error('Failed to update schedule');
  }
  
  // Revalidate the dashboard page
  revalidatePath('/admin');
  revalidateTag(`foodTruck:${foodTruck.subdomain}`)
}

// Server actions for forms
export async function reopenToday() {
  await toggleTodayClosed(false);
}

export async function closeToday() {
  await toggleTodayClosed(true);
}

// Add the function to automatically reset outdated closures
export async function resetOutdatedClosures(foodTruck: any) {
  'use server'
  
  if (!foodTruck?.configuration?.schedule?.days) return null;
  
  const days = foodTruck.configuration.schedule.days;
  let needsUpdate = false;
  
  // Current date
  const now = new Date();
  
  // Check each day for outdated closures
  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    
    // Skip days that aren't closed or don't have a timestamp
    if (!day.isClosed || !day.closureTimestamp) continue;
    
    // Get the timezone for this specific schedule day (use fallback)
    const scheduleTimezone = day.timezone || foodTruck.configuration?.primaryTimezone || 'America/New_York'; 
    
    try {
      const closureDateUtc = new Date(day.closureTimestamp);
      // Get the current time and start of today *in the schedule's specific timezone*
      const nowInScheduleTimezone = toZonedTime(new Date(), scheduleTimezone);
      const startOfTodayInScheduleTimezone = startOfDay(nowInScheduleTimezone);

      // Check if the closure timestamp (UTC) is before the start of today in the schedule's timezone
      if (isBefore(closureDateUtc, startOfTodayInScheduleTimezone)) {
        // Reset the closure
        days[i].isClosed = false;
        delete days[i].closureTimestamp;
        needsUpdate = true;
      }
    } catch (error) {
       console.error(`Error processing closure reset for day ${day.day} with timezone ${scheduleTimezone}:`, error);
       // Decide how to handle errors, e.g., skip this day
       continue; 
    }
  }
  
  // If any closures were reset, update the database
  if (needsUpdate) {
    const supabase = await createClient();
    
    // Update the configuration
    const updatedConfig = { ...foodTruck.configuration };
    updatedConfig.schedule.days = days;
    
    await supabase
      .from('FoodTrucks')
      .update({
        configuration: updatedConfig,
        updated_at: new Date().toISOString()
      })
      .eq('id', foodTruck.id);
    
    // Revalidate the page
    revalidatePath('/admin');
  }
  
  return needsUpdate;
} 