import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { isScheduledOpenServer, getTodayScheduleServer } from "@/lib/schedule-utils-server";

/**
 * Validates and formats a phone number.
 * Converts different formats to a consistent format with dashes (e.g., 123-456-7890)
 * @param phoneNumber The phone number to validate and format
 * @returns The formatted phone number or null if invalid
 */
function validateAndFormatPhoneNumber(phoneNumber: string): string | null {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Basic validation for US numbers (10 digits)
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return null;
  }
  
  // Format based on length - assuming US format for 10 digits
  if (digitsOnly.length === 10) {
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  } 
  // For international numbers (assuming country code + 10 digits)
  else if (digitsOnly.length > 10) {
    const countryCode = digitsOnly.slice(0, digitsOnly.length - 10);
    const nationalNumber = digitsOnly.slice(digitsOnly.length - 10);
    return `+${countryCode}-${nationalNumber.slice(0, 3)}-${nationalNumber.slice(3, 6)}-${nationalNumber.slice(6)}`;
  }
  
  // If we get here, just return the digits with basic formatting
  return digitsOnly;
}

/**
 * POST /api/orders
 * 
 * Creates a new order in the database
 * 
 * In the future, this will integrate with Stripe:
 * 1. Get the food truck's Stripe API key from the database
 * 2. Create a Stripe payment intent using the food truck's API key
 * 3. Process the payment
 * 4. On successful payment, create the order in the database
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    // Validate required fields
    const { 
      food_truck_id, 
      customer_name, 
      customer_email, 
      customer_phone_number,
      items, 
      total_amount,
      pickup_time,
      is_asap 
    } = body;
    
    if (!food_truck_id || !customer_name || !customer_phone_number || !items || !total_amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate and format phone number
    const formattedPhoneNumber = validateAndFormatPhoneNumber(customer_phone_number);
    if (!formattedPhoneNumber) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }
    
    // Validate items format
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items must be a non-empty array' },
        { status: 400 }
      );
    }
    
    // Validate pickup time if provided
    if (pickup_time && !is_asap) {
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
    
    // Fetch the food truck data
    const { data: foodTruck } = await supabase
      .from('FoodTrucks')
      .select('configuration')
      .eq('id', food_truck_id)
      .single();
    console.log('Food truck data:', foodTruck);
    
    if (!foodTruck) {
      console.error('Food truck not found for ID:', food_truck_id);
      return NextResponse.json(
        { error: 'Food truck not found' },
        { status: 404 }
      );
    }
    
    // Check if the food truck is currently open
    const scheduleData = foodTruck.configuration?.schedule?.days || [];
    const todaySchedule = getTodayScheduleServer(scheduleData);
    const isCurrentlyOpen = isScheduledOpenServer(todaySchedule);
    
    if (!isCurrentlyOpen) {
      return NextResponse.json(
        { error: 'Food truck is currently closed. Orders cannot be placed at this time.' },
        { status: 400 }
      );
    }
    
    // TODO: In the future, get the food truck's Stripe API key and process payment
    // const { data: foodTruck } = await supabase
    //   .from('FoodTrucks')
    //   .select('stripe_api_key')
    //   .eq('id', food_truck_id)
    //   .single();
    
    // if (!foodTruck?.stripe_api_key) {
    //   return NextResponse.json(
    //     { error: 'Food truck is not configured for payments' },
    //     { status: 400 }
    //   );
    // }
    
    // Process payment with Stripe using the food truck's API key
    // const stripe = new Stripe(foodTruck.stripe_api_key);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(total_amount * 100), // Convert to cents
    //   currency: 'usd',
    //   metadata: {
    //     food_truck_id,
    //     customer_name,
    //     customer_email
    //   }
    // });
    
    // Create the order in the database
    const { data, error } = await supabase
      .from('Orders')
      .insert({
        food_truck_id,
        customer_name,
        customer_email,
        customer_phone_number: formattedPhoneNumber,
        items,
        total_amount,
        status: 'preparing', // Status must be one of: 'preparing', 'ready', 'completed'
        pickup_time: pickup_time || null,
        is_asap: is_asap !== undefined ? is_asap : true,
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating order:', error);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      orderId: data.id 
    });
    
  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 