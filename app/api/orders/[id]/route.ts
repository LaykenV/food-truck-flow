import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/lib/fetch-order';

/**
 * GET /api/orders/[id]
 * 
 * Fetches an order by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;
    
    const { data, error } = await supabase
      .from('Orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(data as Order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[id]
 * 
 * Updates an order's status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;
    const body = await request.json();
    
    // Validate status
    const { status, pickup_time, is_asap } = body;
    const validStatuses = ['preparing', 'ready', 'completed'];
    
    // If updating status, validate it
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: preparing, ready, completed' },
        { status: 400 }
      );
    }
    
    // If updating pickup time, validate it
    if (pickup_time !== undefined) {
      if (pickup_time !== null) {
        const pickupDate = new Date(pickup_time);
        const now = new Date();
        
        if (isNaN(pickupDate.getTime())) {
          return NextResponse.json(
            { error: 'Invalid pickup time format' },
            { status: 400 }
          );
        }
        
        if (pickupDate < now) {
          return NextResponse.json(
            { error: 'Pickup time cannot be in the past' },
            { status: 400 }
          );
        }
      }
    }
    
    // Build update object with only the fields that are provided
    const updateData: Partial<Order> = {};
    if (status) updateData.status = status;
    if (pickup_time !== undefined) updateData.pickup_time = pickup_time;
    if (is_asap !== undefined) updateData.is_asap = is_asap;
    
    // Update the order
    const { error } = await supabase
      .from('Orders')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: `Order updated successfully`
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 