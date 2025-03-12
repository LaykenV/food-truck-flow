import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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
    
    return NextResponse.json(data);
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
    const { status } = body;
    const validStatuses = ['preparing', 'ready', 'completed'];
    
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: preparing, ready, completed' },
        { status: 400 }
      );
    }
    
    // Update the order status
    const { error } = await supabase
      .from('Orders')
      .update({ status })
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
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 