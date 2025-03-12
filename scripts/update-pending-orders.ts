import { createClient } from '@/utils/supabase/server';

/**
 * This script updates all orders with status 'pending' to 'preparing'
 * Run with: npx tsx scripts/update-pending-orders.ts
 */
async function updatePendingOrders() {
  try {
    console.log('Connecting to Supabase...');
    const supabase = await createClient();
    
    console.log('Fetching orders with status "pending"...');
    const { data: pendingOrders, error: fetchError } = await supabase
      .from('Orders')
      .select('id')
      .eq('status', 'pending');
    
    if (fetchError) {
      throw new Error(`Error fetching pending orders: ${fetchError.message}`);
    }
    
    console.log(`Found ${pendingOrders?.length || 0} orders with status "pending"`);
    
    if (!pendingOrders || pendingOrders.length === 0) {
      console.log('No pending orders to update.');
      return;
    }
    
    console.log('Updating orders to status "preparing"...');
    const { error: updateError } = await supabase
      .from('Orders')
      .update({ status: 'preparing', updated_at: new Date().toISOString() })
      .eq('status', 'pending');
    
    if (updateError) {
      throw new Error(`Error updating orders: ${updateError.message}`);
    }
    
    console.log(`Successfully updated ${pendingOrders.length} orders from "pending" to "preparing"`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the function
updatePendingOrders(); 