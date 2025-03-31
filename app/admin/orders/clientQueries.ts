import { createClient } from '@/utils/supabase/client'

// Function to get orders for the current user's food truck
export async function getOrders() {
  const supabase = createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // Get the food truck ID for the current user
  const { data: foodTruck, error: foodTruckError } = await supabase
    .from('FoodTrucks')
    .select('id')
    .eq('user_id', user.id)
    .single()
  
  if (foodTruckError || !foodTruck) {
    throw new Error('Food truck not found')
  }
  
  // Fetch orders for this food truck
  const { data, error } = await supabase
    .from('Orders')
    .select('*')
    .eq('food_truck_id', foodTruck.id)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  return data || []
} 