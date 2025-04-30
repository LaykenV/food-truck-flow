'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidateTag } from 'next/cache'

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: foodTruckData, error: foodTruckError } = await supabase
    .from('FoodTrucks')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (foodTruckError) throw foodTruckError
  
  try {
    
    const { error } = await supabase
      .from('Orders')
      .update({ 
        status: newStatus, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId)
      .eq('food_truck_id', foodTruckData?.id)
    if (error) throw error
    
    // Revalidate cache after update
    revalidateTag('orders')
    
    return { success: true }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error }
  }
} 