'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidateTag } from 'next/cache'

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('Orders')
      .update({ 
        status: newStatus, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId)
    
    if (error) throw error
    
    // Revalidate cache after update
    revalidateTag('orders')
    
    return { success: true }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error }
  }
} 