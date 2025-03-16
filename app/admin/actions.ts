'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

interface ScheduleDay {
  day: string;
  location?: string;
  address?: string;
  hours?: string;
}

export async function updateSchedule(schedule: ScheduleDay[]) {
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
      days: schedule
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
  
  // Revalidate the dashboard page
  revalidatePath('/admin');
  
  return { success: true, timestamp: new Date() };
} 