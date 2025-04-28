import { getFoodTruckByHostname } from './getFoodTruckByHostname';
import { unstable_cacheTag, unstable_cacheLife } from 'next/cache';
import { createClient } from '@/utils/supabase/client';
import { createClient as createClientServer } from '@/utils/supabase/server';

export async function getFoodTruckData(subdomain: string, isAdmin = false) {
  'use cache';
  unstable_cacheTag(`foodTruck:${subdomain}`);
  unstable_cacheLife({ stale: 300, revalidate: 300 });
  
  const foodTruck = await getFoodTruckByHostname(subdomain, isAdmin);
  
  if (foodTruck) {
    // Fetch menu items together with food truck data
    const menuItems = await getMenuItemsInternal(foodTruck.id);
    return {
      ...foodTruck,
      menuItems
    };
  }
  
  return foodTruck;
};

export async function getFoodTruckDataByUserId(userId: string) {
  
  const supabase = createClient();
  const { data, error } = await supabase.from('FoodTrucks').select('*').eq('user_id', userId).single();
  console.log('Food truck data by user id:', data);
  return data;
}

// Internal function to fetch menu items (moved from getMenuItems.ts)
async function getMenuItemsInternal(foodTruckId: string) {
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
  
  return data || [];
}