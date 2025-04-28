import { createClient } from '@/utils/supabase/server';
import { format } from 'date-fns';

/**
 * Track a page view for a food truck
 * This function should be called on the public-facing website
 * to track page views for analytics
 */
export async function trackPageView(foodTruckId: string) {
  try {
    const supabase = await createClient();
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // First try to update an existing record
    const { data: existingRecord } = await supabase
      .from('Analytics')
      .select('id, page_views')
      .eq('food_truck_id', foodTruckId)
      .eq('date', today)
      .maybeSingle();
    
    if (existingRecord) {
      // Update existing record
      await supabase
        .from('Analytics')
        .update({
          page_views: (existingRecord.page_views || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecord.id);
    } else {
      // Create new record
      await supabase
        .from('Analytics')
        .insert({
          food_truck_id: foodTruckId,
          date: today,
          page_views: 1
        });
    }
    console.log('Page view tracked for food truck:', foodTruckId);
    return true;
  } catch (error) {
    console.error('Error tracking page view:', error);
    return false;
  }
} 