import { createClient } from '@/utils/supabase/server';

/**
 * Fetches an order by ID
 * 
 * @param orderId The ID of the order to fetch
 * @returns The order data or null if not found
 */
export async function getOrderById(orderId: string) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('Orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

/**
 * Fetches the status of an order
 * 
 * @param orderId The ID of the order to fetch the status for
 * @returns The order status or null if not found
 */
export async function getOrderStatus(orderId: string) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('Orders')
      .select('status')
      .eq('id', orderId)
      .single();
    
    if (error) {
      console.error('Error fetching order status:', error);
      return null;
    }
    
    return data.status;
  } catch (error) {
    console.error('Error fetching order status:', error);
    return null;
  }
}

/**
 * Updates the status of an order
 * 
 * @param orderId The ID of the order to update
 * @param status The new status (must be one of: 'preparing', 'ready', 'completed')
 * @returns True if the update was successful, false otherwise
 */
export async function updateOrderStatus(orderId: string, status: 'preparing' | 'ready' | 'completed') {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('Orders')
      .update({ status })
      .eq('id', orderId);
    
    if (error) {
      console.error('Error updating order status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
} 