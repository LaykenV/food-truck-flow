import { createClient } from "@/utils/supabase/client";

export async function getUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function getFoodTruck( ) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('FoodTrucks').select('*').eq('user_id', user?.id).single();
  return data;  
}

export async function getMenuItems() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get the food truck ID for the current user
  const { data: foodTruck } = await supabase
    .from('FoodTrucks')
    .select('id')
    .eq('user_id', user?.id)
    .single();
  
  if (!foodTruck) return [];
  
  // Fetch menu items for this food truck
  const { data, error } = await supabase
    .from('Menus')
    .select('*')
    .eq('food_truck_id', foodTruck.id)
    .order('name');
  
  if (error) throw error;
  
  return data || [];
}

export async function getCategories() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get the food truck ID for the current user
  const { data: foodTruck } = await supabase
    .from('FoodTrucks')
    .select('id')
    .eq('user_id', user?.id)
    .single();
  
  if (!foodTruck) return [];
  
  // Fetch categories for this food truck
  const { data, error } = await supabase
    .from('Menus')
    .select('category')
    .eq('food_truck_id', foodTruck.id)
    .order('category');
  
  if (error) throw error;
  
  // Extract unique categories
  const existingCategories = Array.from(new Set(data?.map(item => item.category) || []))
    .filter(Boolean) as string[];
  
  return existingCategories;
}

// Helper function to get schedule data from the food truck data
export function getScheduleFromFoodTruck(foodTruck: any) {
  if (!foodTruck || !foodTruck.configuration) return {
    days: [],
    title: 'Weekly Schedule',
    description: 'Find us at these locations throughout the week'
  };
  
  return {
    days: foodTruck.configuration.schedule?.days || [],
    title: foodTruck.configuration.schedule?.title || 'Weekly Schedule',
    description: foodTruck.configuration.schedule?.description || 'Find us at these locations throughout the week',
    primaryColor: foodTruck.configuration?.primaryColor || '#FF6B35'
  };
}

export async function getAnalyticsData() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get the food truck ID for the current user
  const { data: foodTruck } = await supabase
    .from('FoodTrucks')
    .select('id, subscription_plan')
    .eq('user_id', user?.id)
    .single();
  
  if (!foodTruck) return null;
  
  // Get analytics data
  const { data: analyticsData } = await supabase
    .from('Analytics')
    .select('*')
    .eq('food_truck_id', foodTruck.id)
    .order('date', { ascending: false });
  
  return {
    analyticsData: analyticsData || [],
    subscriptionPlan: foodTruck.subscription_plan
  };
}