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

// Define Item structure from client request
interface RequestItem {
  id: string;
  quantity: number;
  notes?: string;
  // Other fields sent by client like name/price are ignored for validation
}

// Define structure for Menu items fetched from DB
interface MenuItem {
  id: string;
  price: number;
  // Other fields like name, description, etc.
}

/**
 * POST /api/orders
 *
 * Creates a new order in the database
 * Validates items, calculates total price server-side, checks open status.
 *
 * Future: Integrate with Stripe for payments.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate required fields (excluding total_amount now)
    const {
      food_truck_id,
      customer_name,
      customer_email, // optional but good practice to handle
      customer_phone_number,
      items: requestItems, // Rename to avoid confusion with DB items
      pickup_time,
      is_asap
    }: {
      food_truck_id: string;
      customer_name: string;
      customer_email?: string;
      customer_phone_number: string;
      items: RequestItem[];
      pickup_time?: string;
      is_asap?: boolean;
    } = body;

    // Basic presence validation (total_amount is removed)
    if (!food_truck_id || !customer_name || !customer_phone_number || !requestItems) {
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

    // Validate items format and quantity
    if (!Array.isArray(requestItems) || requestItems.length === 0) {
      return NextResponse.json(
        { error: 'Items must be a non-empty array' },
        { status: 400 }
      );
    }
    // Ensure quantities are valid numbers > 0
    if (requestItems.some(item => typeof item.quantity !== 'number' || item.quantity <= 0 || !Number.isInteger(item.quantity))) {
       return NextResponse.json(
           { error: 'Invalid item quantity detected' },
           { status: 400 }
       );
    }

    // Validate customer name (example: check length)
    if (customer_name.trim().length === 0 || customer_name.length > 100) {
      return NextResponse.json(
        { error: 'Invalid customer name' },
        { status: 400 }
      );
    }


    // Validate pickup time format and ensure it's not in the past
    let parsedPickupTime: Date | null = null;
    if (pickup_time && is_asap === false) { // Only validate if a specific time is requested
      parsedPickupTime = new Date(pickup_time);
      const now = new Date();

      if (isNaN(parsedPickupTime.getTime())) {
        return NextResponse.json(
          { error: 'Invalid pickup time format' },
          { status: 400 }
        );
      }

      // Allow a small buffer (e.g., 1 min) for clock differences
      if (parsedPickupTime.getTime() < now.getTime() - 60000) {
        return NextResponse.json(
          { error: 'Pickup time cannot be in the past' },
          { status: 400 }
        );
      }
    }

    // Fetch the food truck data (including schedule for validation)
    const { data: foodTruck, error: ftError } = await supabase
      .from('FoodTrucks')
      .select('configuration') // Select only what's needed
      .eq('id', food_truck_id)
      .single();

    if (ftError || !foodTruck) {
      console.error('Error fetching food truck or not found:', ftError);
      return NextResponse.json(
        { error: 'Food truck not found' },
        { status: 404 }
      );
    }

    // Check if the food truck is generally open based on schedule
    // Note: This assumes schedule-utils handle timezone correctly
    const scheduleData = foodTruck.configuration?.schedule?.days || [];
    const todaySchedule = getTodayScheduleServer(scheduleData);
    const isCurrentlyOpen = isScheduledOpenServer(todaySchedule);

    if (!isCurrentlyOpen) {
      return NextResponse.json(
        { error: 'Food truck is currently closed. Orders cannot be placed at this time.' },
        { status: 400 }
      );
    }

    // Further validation for specific pickup time if provided
    if (parsedPickupTime) {
      // TODO: Implement a check using schedule-utils-server to see if parsedPickupTime
      // is within the allowed ordering window (e.g., > 15 mins before close).
      // Example placeholder:
      // const isValidPickupTime = checkPickupTimeValidity(parsedPickupTime, todaySchedule);
      // if (!isValidPickupTime) {
      //   return NextResponse.json(
      //     { error: 'Selected pickup time is outside of ordering hours.' },
      //     { status: 400 }
      //   );
      // }
       console.warn("Pickup time validation against schedule window not yet fully implemented.");
    }

    // --- Server-side Price Calculation ---
    const itemIds = requestItems.map(item => item.id);

    // Fetch menu items from DB to get current prices
    const { data: menuItems, error: menuError } = await supabase
        .from('Menus')
        .select('id, price, name') // Select only needed fields
        .eq('food_truck_id', food_truck_id)
        .in('id', itemIds);

    if (menuError) {
        console.error('Error fetching menu items:', menuError);
        return NextResponse.json({ error: 'Could not verify items' }, { status: 500 });
    }

    // Check if all requested items were found for this food truck
    if (!menuItems || menuItems.length !== itemIds.length) {
        console.warn('Mismatch between requested items and found menu items. Req:', itemIds, 'Found:', menuItems?.map(i => i.id));
        return NextResponse.json({ error: 'One or more items are invalid or unavailable' }, { status: 400 });
    }

    // Create a price map for quick lookup
    const priceMap = new Map<string, number>();
    menuItems.forEach(item => {
        if (typeof item.price === 'number') {
            priceMap.set(item.id, item.price);
        } else {
            // Handle cases where price might not be a number unexpectedly
             console.error(`Invalid price type for menu item ${item.id}: ${item.price}`);
             // Decide how to handle: throw error, default price, skip item?
             // For now, we'll throw an error to be safe.
             throw new Error(`Invalid price configured for item ${item.id}`);
        }
    });


    // Calculate total server-side and prepare items for insertion
    let serverCalculatedTotal = 0;
    const orderItemsForDB = requestItems.map(reqItem => {
        const price = priceMap.get(reqItem.id);
        if (price === undefined) {
            // This should theoretically not happen if the length check above passed, but safety first.
             console.error(`Price not found for item ${reqItem.id} after initial fetch.`);
             throw new Error(`Configuration error: price unavailable for item ${reqItem.id}`);
        }
        serverCalculatedTotal += price * reqItem.quantity;

        // Return structure suitable for 'Orders.items' JSON column
        return {
            id: reqItem.id,
            name: menuItems.find(item => item.id === reqItem.id)?.name || '',
            price: price, // Store the price used for calculation
            quantity: reqItem.quantity,
            notes: reqItem.notes || ''
        };
    });

    // Optional: Add minimum order value check
    // const minimumOrderValue = foodTruck.configuration?.minimumOrderValue || 0;
    // if (serverCalculatedTotal < minimumOrderValue) {
    //    return NextResponse.json(
    //        { error: `Minimum order value is ${formatCurrency(minimumOrderValue)}` },
    //        { status: 400 }
    //    );
    // }

    // --- End Server-side Price Calculation ---


    // TODO: Stripe Payment Integration would go here, using serverCalculatedTotal

    // Create the order using server-calculated total and validated items
    const { data: insertedOrder, error: insertError } = await supabase
      .from('Orders')
      .insert({
        food_truck_id,
        customer_name: customer_name.trim(), // Store trimmed name
        customer_email: customer_email || null, // Handle optional email
        customer_phone_number: formattedPhoneNumber,
        items: orderItemsForDB, // Use the validated/priced items
        total_amount: serverCalculatedTotal, // Use server-calculated total
        status: 'preparing',
        pickup_time: parsedPickupTime ? parsedPickupTime.toISOString() : null,
        is_asap: is_asap === undefined ? true : is_asap, // Default is_asap to true if not provided
      })
      .select('id') // Select only the ID
      .single();

    console.log(insertedOrder)

    if (insertError) {
      console.error('Error creating order:', insertError);
      return NextResponse.json(
        { error: 'Failed to create order. ' + insertError.message },
        { status: 500 }
      );
    }

    // Return success with the order ID
    return NextResponse.json({
      success: true,
      orderId: insertedOrder.id
    });

  } catch (error: any) {
    console.error('Critical error processing order:', error);
    // Ensure a generic error is returned for unexpected issues
    return NextResponse.json(
      // Provide a more specific message if it's a known error type, otherwise generic
      { error: error.message || 'Internal server error processing order' },
      { status: 500 }
    );
  }
} 