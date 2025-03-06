import { createClient } from '@/utils/supabase/server';

export async function getMenuItems(foodTruckId: string) {
  const supabase = await createClient();
  
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