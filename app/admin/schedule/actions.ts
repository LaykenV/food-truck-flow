'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { revalidateTag } from 'next/cache'
import { toZonedTime, format } from 'date-fns-tz' // Correct import for toZonedTime
import { startOfDay } from 'date-fns' // Import startOfDay from base date-fns

interface ScheduleDay {
  day: string;
  location?: string;
  address?: string;
  openTime?: string; // Format: "HH:MM" in 24h format 
  closeTime?: string; // Format: "HH:MM" in 24h format
  isClosed?: boolean; // Override to mark as closed regardless of time
  closureTimestamp?: string; // Timestamp when isClosed was set to true
  coordinates?: {
    lat: number;
    lng: number;
  };
  timezone?: string; // Added timezone field
}

// Fetch food truck schedule data
export async function getScheduleData() {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }
    
    // Fetch food truck data
    const { data: foodTruck, error: foodTruckError } = await supabase
      .from('FoodTrucks')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (foodTruckError) {
      throw new Error(foodTruckError.message || 'Failed to fetch food truck data')
    }
    
    if (!foodTruck) {
      throw new Error('No food truck found')
    }
    
    // Extract schedule data from food truck configuration
    const scheduleData = foodTruck.configuration?.schedule?.days || []
    const primaryColor = foodTruck.configuration?.primaryColor || '#FF6B35'
    const scheduleTitle = foodTruck.configuration?.schedule?.title || 'Weekly Schedule'
    const scheduleDescription = foodTruck.configuration?.schedule?.description || 'Find us at these locations throughout the week'
    
    return { 
      success: true, 
      scheduleData, 
      primaryColor, 
      scheduleTitle, 
      scheduleDescription 
    }
  } catch (err: any) {
    console.error('Error fetching schedule data:', err)
    return { 
      success: false, 
      error: err.message || 'An unknown error occurred' 
    }
  }
}

// Update the schedule
export async function updateSchedule(
  schedule: ScheduleDay[], 
  title?: string, 
  description?: string,
  primaryTimezone?: string
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('You must be logged in to update your schedule')
    }
    
    // Fetch the food truck
    const { data: foodTruck, error: fetchError } = await supabase
      .from('FoodTrucks')
      .select('*')
      .eq('user_id', user.id)
      .single()
      
    if (fetchError) {
      throw new Error('Failed to fetch food truck data')
    }
    
    // Update the configuration with the new schedule object
    const updatedConfig = {
      ...foodTruck.configuration,
      schedule: {
        // Keep existing schedule properties if they exist
        ...(foodTruck.configuration?.schedule || {}), 
        // Update the parts we are changing
        days: schedule,
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(primaryTimezone !== undefined && { primaryTimezone })
      }
    }
    
    // Save the updated configuration
    const { error: updateError } = await supabase
      .from('FoodTrucks')
      .update({
        configuration: updatedConfig,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      
    if (updateError) {
      throw new Error('Failed to update schedule')
    }
    
    // Revalidate the dashboard page and schedule page
    revalidatePath('/admin')
    revalidateTag(`foodTruck:${foodTruck.subdomain}`)

    return { success: true, timestamp: new Date() }
  } catch (err: any) {
    console.error('Error updating schedule:', err)
    return { success: false, error: err.message || 'Failed to update schedule' }
  }
}

// Action to toggle closed status for today
export async function toggleTodayClosed(isClosed: boolean) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Not authenticated')
    }
    
    // Fetch food truck data
    const { data: foodTruck, error: foodTruckError } = await supabase
      .from('FoodTrucks')
      .select('*')
      .eq('user_id', user?.id)
      .single()
    
    if (foodTruckError) {
      throw new Error(foodTruckError.message || 'Failed to fetch food truck data')
    }
    
    if (!foodTruck) {
      throw new Error('Food truck not found')
    }

    // Determine the primary timezone from the schedule object
    const primaryTimezone = foodTruck.configuration?.schedule?.primaryTimezone || 'America/New_York';
    
    // Get today's day name based on the primary timezone
    const nowInPrimaryZone = toZonedTime(new Date(), primaryTimezone);
    const today = format(nowInPrimaryZone, 'EEEE', { timeZone: primaryTimezone }); // E.g., 'Monday'
    
    // Update the configuration with the toggled closed status
    const updatedConfig = { ...foodTruck.configuration }
    
    // Find today's schedule
    if (updatedConfig.schedule && updatedConfig.schedule.days) {
      const todayScheduleIndex = updatedConfig.schedule.days.findIndex((day: ScheduleDay) => day.day === today)
      
      if (todayScheduleIndex !== -1) {
        updatedConfig.schedule.days[todayScheduleIndex].isClosed = isClosed
        
        // Store the timestamp when isClosed was set to true (always store as UTC)
        if (isClosed) {
          updatedConfig.schedule.days[todayScheduleIndex].closureTimestamp = new Date().toISOString()
        } else {
          // Remove the timestamp when reopening
          delete updatedConfig.schedule.days[todayScheduleIndex].closureTimestamp
        }
      } else {
         // Optionally handle the case where there's no schedule for "today" in the determined timezone
         console.warn(`No schedule found for today (${today}) in timezone ${primaryTimezone}`);
      }
    }
    
    // Save the updated configuration
    const { error: updateError } = await supabase
      .from('FoodTrucks')
      .update({
        configuration: updatedConfig,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
    
    if (updateError) {
      throw new Error('Failed to update schedule')
    }
    
    // Revalidate the dashboard page and schedule page
    revalidatePath('/admin')
    revalidateTag(`foodTruck:${foodTruck.subdomain}`)

    
    return { success: true }
  } catch (err: any) {
    console.error('Error toggling today closed:', err)
    return { success: false, error: err.message || 'Failed to update schedule' }
  }
}

// Reset outdated closures
export async function resetOutdatedClosures() {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }
    
    // Fetch food truck data
    const { data: foodTruck, error: foodTruckError } = await supabase
      .from('FoodTrucks')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (foodTruckError) {
      throw new Error(foodTruckError.message || 'Failed to fetch food truck data')
    }
    
    if (!foodTruck || !foodTruck.configuration?.schedule?.days) {
      return { success: true, updated: false }
    }
    
    // Determine the primary timezone from the schedule object (needed for logging/fallback?)
    const primaryTimezone = foodTruck.configuration?.schedule?.primaryTimezone || 'America/New_York';

    const days = foodTruck.configuration.schedule.days
    let needsUpdate = false
    const nowUtc = new Date(); // Use a single UTC timestamp for comparisons
    
    // Check each day for outdated closures
    for (let i = 0; i < days.length; i++) {
      const day = days[i]
      
      // Skip days that aren't closed or don't have a timestamp
      if (!day.isClosed || !day.closureTimestamp) continue
      
      // Get the specific timezone for this schedule entry (fallback needed)
      const scheduleTimezone = day.timezone || primaryTimezone; // Use primary as fallback if day has no timezone
      
      // Get the start of the current day in the schedule's specific timezone
      const startOfTodayInScheduleTimezone = startOfDay(toZonedTime(nowUtc, scheduleTimezone));

      // Parse the UTC closure timestamp
      const closureDate = new Date(day.closureTimestamp) // Already UTC

      // Check if the closure timestamp is before the start of the current day in the schedule's timezone
      if (closureDate < startOfTodayInScheduleTimezone) {
        // Reset the closure
        days[i].isClosed = false
        delete days[i].closureTimestamp
        needsUpdate = true
      }
    }
    
    // If any closures were reset, update the database
    if (needsUpdate) {
      // Update the configuration
      const updatedConfig = { ...foodTruck.configuration }
      updatedConfig.schedule.days = days
      
      const { error: updateError } = await supabase
        .from('FoodTrucks')
        .update({
          configuration: updatedConfig,
          updated_at: new Date().toISOString()
        })
        .eq('id', foodTruck.id)
      
      if (updateError) {
        throw new Error('Failed to reset outdated closures')
      }
      
      // Revalidate the pages
      revalidatePath('/admin')
      revalidateTag(`foodTruck:${foodTruck.subdomain}`)

    }
    
    return { success: true, updated: needsUpdate }
  } catch (err: any) {
    console.error('Error resetting outdated closures:', err)
    return { success: false, error: err.message || 'Failed to reset outdated closures' }
  }
} 