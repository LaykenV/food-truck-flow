import { createClient } from '@/utils/supabase/client';
import { unstable_cacheTag, unstable_cacheLife } from 'next/cache';

export async function getMenuItems(foodTruckId: string) {
  'use cache';
  
  // Use the client-side Supabase client which doesn't need cookies
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('Menus')
    .select('*')
    .eq('food_truck_id', foodTruckId)
    .order('category', { ascending: true });
  
  if (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }

  unstable_cacheTag(`menuItems:${foodTruckId}`);
  unstable_cacheLife({ stale: 300, revalidate: 300 });
  
  return data || [];
} 