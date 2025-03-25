'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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
 * Migrates legacy schedule data to the new format with structured time fields
 * This can be triggered manually or as part of a startup process
 */
export async function migrateScheduleData() {
  const supabase = await createClient();
  
  // Fetch all food trucks
  const { data: foodTrucks, error } = await supabase
    .from('FoodTrucks')
    .select('id, configuration');
    
  if (error) {
    console.error('Error fetching food trucks:', error);
    return { success: false, error };
  }
  
  // Track how many were updated
  let updatedCount = 0;
  
  // Process each food truck
  for (const foodTruck of foodTrucks) {
    let updated = false;
    const config = foodTruck.configuration;
    
    // Skip if no schedule data
    if (!config?.schedule?.days || config.schedule.days.length === 0) {
      continue;
    }
    
    // Check each day
    for (const day of config.schedule.days) {
      // Skip if already has the structured fields
      if (day.openTime && day.closeTime) {
        continue;
      }
      
      // Try to extract times from hours string
      if (day.hours) {
        try {
          // Parse hours like "11:00 AM - 2:00 PM"
          const hoursMatch = day.hours.match(/(\d+):(\d+)\s+(AM|PM)\s+-\s+(\d+):(\d+)\s+(AM|PM)/i);
          
          if (hoursMatch) {
            let [_, startHour, startMinute, startAmPm, endHour, endMinute, endAmPm] = hoursMatch;
            
            // Convert to 24-hour format
            let startHour24 = parseInt(startHour);
            if (startAmPm.toUpperCase() === 'PM' && startHour24 < 12) startHour24 += 12;
            if (startAmPm.toUpperCase() === 'AM' && startHour24 === 12) startHour24 = 0;
            
            let endHour24 = parseInt(endHour);
            if (endAmPm.toUpperCase() === 'PM' && endHour24 < 12) endHour24 += 12;
            if (endAmPm.toUpperCase() === 'AM' && endHour24 === 12) endHour24 = 0;
            
            // Add structured time fields
            day.openTime = `${startHour24.toString().padStart(2, '0')}:${startMinute.padStart(2, '0')}`;
            day.closeTime = `${endHour24.toString().padStart(2, '0')}:${endMinute.padStart(2, '0')}`;
            
            // Set isClosed to false by default
            day.isClosed = false;
            
            updated = true;
          }
        } catch (error) {
          console.error(`Error parsing hours for ${foodTruck.id}, day ${day.day}:`, error);
        }
      }
    }
    
    // Update the food truck if we made changes
    if (updated) {
      const { error: updateError } = await supabase
        .from('FoodTrucks')
        .update({ 
          configuration: config,
          updated_at: new Date().toISOString()
        })
        .eq('id', foodTruck.id);
        
      if (updateError) {
        console.error(`Error updating food truck ${foodTruck.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }
  }
  
  // Revalidate related pages
  revalidatePath('/admin');
  revalidatePath('/admin/schedule');
  
  console.log(`Migration complete. Updated ${updatedCount} food trucks.`);
  
  return { success: true, updatedCount };
} 