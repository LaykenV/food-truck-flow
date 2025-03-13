import { createClient } from '@/utils/supabase/server';

/**
 * Order type definition
 */
export type Order = {
  id: string;
  food_truck_id: string;
  customer_name: string;
  customer_email: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
  }>;
  total_amount: number;
  status: 'preparing' | 'ready' | 'completed';
  created_at: string;
  updated_at: string;
  pickup_time: string | null;
  is_asap: boolean;
};

/**
 * Fetches an order by ID
 * 
 * @param orderId The ID of the order to fetch
 * @returns The order data or null if not found
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
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
    
    return data as Order;
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
export async function getOrderStatus(orderId: string): Promise<Order['status'] | null> {
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
    
    return data.status as Order['status'];
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
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
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

/**
 * Updates the pickup time of an order
 * 
 * @param orderId The ID of the order to update
 * @param pickupTime The new pickup time (ISO string or null for ASAP)
 * @param isAsap Whether the order is marked as ASAP
 * @returns True if the update was successful, false otherwise
 */
export async function updateOrderPickupTime(
  orderId: string, 
  pickupTime: string | null,
  isAsap: boolean
): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // Validate pickup time if provided
    if (pickupTime && !isAsap) {
      const pickupDate = new Date(pickupTime);
      const now = new Date();
      
      if (isNaN(pickupDate.getTime())) {
        console.error('Invalid pickup time format');
        return false;
      }
      
      if (pickupDate < now) {
        console.error('Pickup time cannot be in the past');
        return false;
      }
    }
    
    const { error } = await supabase
      .from('Orders')
      .update({ 
        pickup_time: pickupTime,
        is_asap: isAsap
      })
      .eq('id', orderId);
    
    if (error) {
      console.error('Error updating order pickup time:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating order pickup time:', error);
    return false;
  }
} 